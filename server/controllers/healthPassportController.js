import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Animal from "../models/Animal.js";
import Application from "../models/Application.js";
import HealthPassport from "../models/HealthPassport.js";
import User from "../models/User.js";
import {
  generatePassportNumber,
  normalizeTagList,
  parseOptionalDate,
  summarizePassportHealth,
} from "../utils/passportHelpers.js";

const serverError = (res, error) =>
  res.status(500).json({ message: "Server error", error: error.message });

const resolveOptionalUser = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select("-password");
  } catch {
    return null;
  }
};

const canManagePassport = async (animal, user) => {
  if (!animal || !user) return false;
  if (user.role === "admin") return true;

  const shelterId = animal.shelter?._id ? animal.shelter._id.toString() : animal.shelter.toString();
  if (user.role === "shelter" && shelterId === user._id.toString()) return true;

  if (user.role === "adopter") {
    const approved = await Application.exists({
      animal: animal._id,
      adopter: user._id,
      status: "approved",
    });
    return Boolean(approved);
  }

  return false;
};

const findOrCreatePassport = async (animalId, userId) => {
  let passport = await HealthPassport.findOne({ animal: animalId });
  if (!passport) {
    passport = new HealthPassport({
      animal: animalId,
      passportNumber: generatePassportNumber(),
      lastUpdatedBy: userId,
    });
  }
  return passport;
};

const loadPopulatedPassport = (animalId) =>
  HealthPassport.findOne({ animal: animalId }).populate("lastUpdatedBy", "name role");

const findAuthorizedAnimal = async (animalId, user, res) => {
  if (!mongoose.isValidObjectId(animalId)) {
    res.status(404).json({ message: "Animal not found" });
    return null;
  }
  const animal = await Animal.findById(animalId);
  if (!animal) {
    res.status(404).json({ message: "Animal not found" });
    return null;
  }
  if (!(await canManagePassport(animal, user))) {
    res.status(403).json({ message: "Not authorized to update this pet's passport" });
    return null;
  }
  return animal;
};

// @route  GET /api/passports/my
// @desc   Lists animals & passport summaries manageable by the logged-in shelter, adopter, or admin
export const getMyPassports = async (req, res) => {
  try {
    let animalFilter = {};

    if (req.user.role === "shelter") {
      animalFilter = { shelter: req.user._id };
    } else if (req.user.role === "adopter") {
      const approvedAnimalIds = await Application.find({
        adopter: req.user._id,
        status: "approved",
      }).distinct("animal");
      animalFilter = { _id: { $in: approvedAnimalIds } };
    }

    const animals = await Animal.find(animalFilter)
      .populate("shelter", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    const animalIds = animals.map((a) => a._id);
    const passports = await HealthPassport.find({ animal: { $in: animalIds } }).lean();
    const passportByAnimal = new Map(passports.map((p) => [p.animal.toString(), p]));

    const items = animals.map((animal) => {
      const passport = passportByAnimal.get(animal._id.toString()) || null;
      return {
        animal,
        passport,
        summary: summarizePassportHealth(passport),
      };
    });

    res.status(200).json(items);
  } catch (error) {
    serverError(res, error);
  }
};

// @route  GET /api/passports/animal/:animalId
// @desc   Public read-only view of an animal's Health Passport + edit permission flag for current user
export const getPassportByAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;
    if (!mongoose.isValidObjectId(animalId)) {
      return res.status(404).json({ message: "Animal not found" });
    }

    const animal = await Animal.findById(animalId)
      .populate("shelter", "name email phone address")
      .lean();
    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }

    const [passport, user] = await Promise.all([
      loadPopulatedPassport(animalId).lean(),
      resolveOptionalUser(req),
    ]);

    const canEdit = await canManagePassport(animal, user);

    res.status(200).json({
      animal,
      passport: passport || null,
      summary: summarizePassportHealth(passport),
      canEdit,
    });
  } catch (error) {
    serverError(res, error);
  }
};

// @route  PUT /api/passports/animal/:animalId
// @desc   Create or update baseline Health Passport metadata
export const upsertPassportDetails = async (req, res) => {
  try {
    const { animalId } = req.params;
    const animal = await findAuthorizedAnimal(animalId, req.user, res);
    if (!animal) return;

    const passport = await findOrCreatePassport(animalId, req.user._id);

    const {
      microchipId,
      bloodGroup,
      weightKg,
      spayedNeutered,
      allergies,
      chronicConditions,
      dietaryNotes,
      emergencyVetContact,
    } = req.body;

    if (microchipId !== undefined) passport.microchipId = String(microchipId).trim();
    if (bloodGroup !== undefined) passport.bloodGroup = String(bloodGroup).trim();
    if (dietaryNotes !== undefined) passport.dietaryNotes = String(dietaryNotes).trim();
    if (spayedNeutered !== undefined) passport.spayedNeutered = Boolean(spayedNeutered);

    if (weightKg !== undefined) {
      if (weightKg === "" || weightKg === null) {
        passport.weightKg = null;
      } else {
        const parsedWeight = Number(weightKg);
        if (Number.isNaN(parsedWeight) || parsedWeight < 0) {
          return res.status(400).json({ message: "Weight must be a non-negative number" });
        }
        passport.weightKg = parsedWeight;
      }
    }

    if (allergies !== undefined) passport.allergies = normalizeTagList(allergies);
    if (chronicConditions !== undefined) {
      passport.chronicConditions = normalizeTagList(chronicConditions);
    }

    if (emergencyVetContact && typeof emergencyVetContact === "object") {
      passport.emergencyVetContact = {
        clinicName: String(emergencyVetContact.clinicName || "").trim(),
        phone: String(emergencyVetContact.phone || "").trim(),
      };
    }

    passport.lastUpdatedBy = req.user._id;
    await passport.save();

    const populated = await loadPopulatedPassport(animalId);
    res.status(200).json(populated);
  } catch (error) {
    serverError(res, error);
  }
};

// @route  POST /api/passports/animal/:animalId/vaccinations
// @desc   Add a vaccination entry to an animal's Health Passport
export const addVaccination = async (req, res) => {
  try {
    const { animalId } = req.params;
    const animal = await findAuthorizedAnimal(animalId, req.user, res);
    if (!animal) return;

    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const administered = parseOptionalDate(req.body.dateAdministered);
    const nextDue = parseOptionalDate(req.body.nextDueDate);

    if (!name || !administered || administered === "INVALID") {
      return res.status(400).json({ message: "Vaccine name and valid administration date are required" });
    }
    if (nextDue === "INVALID") {
      return res.status(400).json({ message: "Next due date is invalid" });
    }
    if (nextDue && nextDue < administered) {
      return res.status(400).json({ message: "Next due date cannot be earlier than administration date" });
    }

    const passport = await findOrCreatePassport(animalId, req.user._id);
    passport.vaccinations.unshift({
      name,
      dateAdministered: administered,
      nextDueDate: nextDue,
      vetName: String(req.body.vetName || "").trim(),
      clinicName: String(req.body.clinicName || "").trim(),
      batchNumber: String(req.body.batchNumber || "").trim(),
      notes: String(req.body.notes || "").trim(),
    });
    passport.lastUpdatedBy = req.user._id;
    await passport.save();

    const populated = await loadPopulatedPassport(animalId);
    res.status(201).json(populated);
  } catch (error) {
    serverError(res, error);
  }
};

// @route  DELETE /api/passports/animal/:animalId/vaccinations/:vaxId
// @desc   Remove a vaccination entry from an animal's Health Passport
export const deleteVaccination = async (req, res) => {
  try {
    const { animalId, vaxId } = req.params;
    if (!mongoose.isValidObjectId(vaxId)) {
      return res.status(404).json({ message: "Record not found" });
    }
    const animal = await findAuthorizedAnimal(animalId, req.user, res);
    if (!animal) return;

    const passport = await HealthPassport.findOne({ animal: animalId });
    if (!passport) return res.status(404).json({ message: "Health passport not found" });

    const entry = passport.vaccinations.id(vaxId);
    if (!entry) return res.status(404).json({ message: "Vaccination entry not found" });

    entry.deleteOne();
    passport.lastUpdatedBy = req.user._id;
    await passport.save();

    const populated = await loadPopulatedPassport(animalId);
    res.status(200).json(populated);
  } catch (error) {
    serverError(res, error);
  }
};

// @route  POST /api/passports/animal/:animalId/records
// @desc   Add a medical record entry (checkup, treatment, surgery, deworming, lab test, etc.)
export const addMedicalRecord = async (req, res) => {
  try {
    const { animalId } = req.params;
    const animal = await findAuthorizedAnimal(animalId, req.user, res);
    if (!animal) return;

    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const date = parseOptionalDate(req.body.date);

    if (!title || !date || date === "INVALID") {
      return res.status(400).json({ message: "Record title and valid date are required" });
    }

    const passport = await findOrCreatePassport(animalId, req.user._id);
    passport.medicalRecords.unshift({
      title,
      recordType: req.body.recordType || "Checkup",
      date,
      vetName: String(req.body.vetName || "").trim(),
      clinicName: String(req.body.clinicName || "").trim(),
      diagnosis: String(req.body.diagnosis || "").trim(),
      medication: String(req.body.medication || "").trim(),
      notes: String(req.body.notes || "").trim(),
    });
    passport.lastUpdatedBy = req.user._id;
    await passport.save();

    const populated = await loadPopulatedPassport(animalId);
    res.status(201).json(populated);
  } catch (error) {
    serverError(res, error);
  }
};

// @route  DELETE /api/passports/animal/:animalId/records/:recordId
// @desc   Remove a medical record entry from an animal's Health Passport
export const deleteMedicalRecord = async (req, res) => {
  try {
    const { animalId, recordId } = req.params;
    if (!mongoose.isValidObjectId(recordId)) {
      return res.status(404).json({ message: "Record not found" });
    }
    const animal = await findAuthorizedAnimal(animalId, req.user, res);
    if (!animal) return;

    const passport = await HealthPassport.findOne({ animal: animalId });
    if (!passport) return res.status(404).json({ message: "Health passport not found" });

    const entry = passport.medicalRecords.id(recordId);
    if (!entry) return res.status(404).json({ message: "Medical record not found" });

    entry.deleteOne();
    passport.lastUpdatedBy = req.user._id;
    await passport.save();

    const populated = await loadPopulatedPassport(animalId);
    res.status(200).json(populated);
  } catch (error) {
    serverError(res, error);
  }
};
