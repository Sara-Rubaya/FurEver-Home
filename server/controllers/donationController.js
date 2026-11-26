import mongoose from "mongoose";
import Animal from "../models/Animal.js";
import Donation from "../models/Donation.js";
import User from "../models/User.js";

const METHODS = ["bKash", "Nagad", "Card", "Bank"];
const isId = mongoose.isValidObjectId;
const serverError = (res, error) =>
  res.status(500).json({ message: "Server error", error: error.message });

// verified donation er total & donor count, animal wise
const raisedMap = async (animalIds) => {
  const rows = await Donation.aggregate([
    { $match: { animal: { $in: animalIds }, status: "verified" } },
    { $group: { _id: "$animal", raised: { $sum: "$amount" }, donors: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [String(r._id), r]));
};

const progress = (animal, row) => {
  const raised = row?.raised || 0;
  const percent = animal.sponsorGoal ? Math.min(100, Math.round((raised / animal.sponsorGoal) * 100)) : 0;
  return { raised, donors: row?.donors || 0, percent };
};

// GET /api/donations/sponsor-pets   (public) - goal set kora animal gulo
export const getSponsorPets = async (req, res) => {
  try {
    const animals = await Animal.find({ sponsorGoal: { $gt: 0 }, status: { $ne: "adopted" } })
      .populate("shelter", "name")
      .sort({ createdAt: -1 })
      .lean();
    const map = await raisedMap(animals.map((a) => a._id));
    res.status(200).json(animals.map((a) => ({ ...a, ...progress(a, map[String(a._id)]) })));
  } catch (error) {
    serverError(res, error);
  }
};

// GET /api/donations/wall   (public) - stats + recent supporters + top donors
export const getWall = async (req, res) => {
  try {
    const [[stats], recent, top] = await Promise.all([
      Donation.aggregate([
        { $match: { status: "verified" } },
        { $group: { _id: null, totalRaised: { $sum: "$amount" }, donations: { $sum: 1 }, donors: { $addToSet: "$donor" } } },
      ]),
      Donation.find({ status: "verified" })
        .sort({ createdAt: -1 })
        .limit(12)
        .populate("donor", "name")
        .populate("animal", "name")
        .lean(),
      Donation.aggregate([
        { $match: { status: "verified", isAnonymous: false } },
        { $group: { _id: "$donor", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "u" } },
        { $project: { _id: 0, total: 1, name: { $arrayElemAt: ["$u.name", 0] } } },
      ]),
    ]);

    res.status(200).json({
      stats: {
        totalRaised: stats?.totalRaised || 0,
        donations: stats?.donations || 0,
        donors: stats?.donors.length || 0,
      },
      // anonymous donor er naam pathano hoy na
      recent: recent.map((d) => ({
        _id: d._id,
        name: d.isAnonymous ? "Anonymous" : d.donor?.name,
        amount: d.amount,
        message: d.message,
        animalName: d.animal?.name || null,
        createdAt: d.createdAt,
      })),
      top,
    });
  } catch (error) {
    serverError(res, error);
  }
};

// GET /api/donations/shelters   (public) - general donation er dropdown
export const getShelters = async (req, res) => {
  try {
    res.status(200).json(await User.find({ role: "shelter" }).select("name phone").lean());
  } catch (error) {
    serverError(res, error);
  }
};

// GET /api/donations/animal/:animalId   (public) - ek animal er sponsor progress
export const getAnimalSponsor = async (req, res) => {
  try {
    if (!isId(req.params.animalId)) return res.status(404).json({ message: "Animal not found" });

    const animal = await Animal.findById(req.params.animalId).populate("shelter", "name phone").lean();
    if (!animal) return res.status(404).json({ message: "Animal not found" });

    const map = await raisedMap([animal._id]);
    const supporters = await Donation.find({ animal: animal._id, status: "verified" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("donor", "name")
      .lean();

    res.status(200).json({
      animalId: animal._id,
      name: animal.name,
      status: animal.status,
      sponsorGoal: animal.sponsorGoal,
      shelter: animal.shelter,
      ...progress(animal, map[String(animal._id)]),
      supporters: supporters.map((d) => ({
        name: d.isAnonymous ? "Anonymous" : d.donor?.name,
        amount: d.amount,
      })),
    });
  } catch (error) {
    serverError(res, error);
  }
};

// POST /api/donations   (logged-in)
export const createDonation = async (req, res) => {
  try {
    const { animalId, shelterId, amount, method, transactionId, message, isAnonymous } = req.body;
    const amt = Number(amount);

    if (!(amt >= 10) || !METHODS.includes(method) || !transactionId?.trim()) {
      return res.status(400).json({ message: "Amount (min 10), method and transaction ID are required" });
    }

    let animal = null;
    let shelter = shelterId;

    if (animalId) {
      if (!isId(animalId)) return res.status(400).json({ message: "Invalid animal" });
      animal = await Animal.findById(animalId);
      if (!animal || animal.status === "adopted") {
        return res.status(400).json({ message: "This animal cannot be sponsored" });
      }
      shelter = animal.shelter;
    } else if (!isId(shelterId) || !(await User.exists({ _id: shelterId, role: "shelter" }))) {
      return res.status(400).json({ message: "Please choose a valid shelter" });
    }

    const donation = await Donation.create({
      donor: req.user._id,
      shelter,
      animal: animal?._id || null,
      amount: amt,
      method,
      transactionId,
      message,
      isAnonymous: Boolean(isAnonymous),
    });

    res.status(201).json(donation);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This transaction ID was already submitted" });
    }
    if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
    serverError(res, error);
  }
};

// GET /api/donations/mine   (logged-in)
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate("animal", "name photoUrl")
      .populate("shelter", "name")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(donations);
  } catch (error) {
    serverError(res, error);
  }
};

// GET /api/donations/received   (shelter / admin)
export const getReceived = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { shelter: req.user._id };
    const donations = await Donation.find(filter)
      .populate("donor", "name email")
      .populate("animal", "name")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(donations);
  } catch (error) {
    serverError(res, error);
  }
};

// PATCH /api/donations/:id/status   (shelter / admin) - transaction check kore verify/reject
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (!isId(req.params.id)) return res.status(404).json({ message: "Donation not found" });

    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (req.user.role !== "admin" && donation.shelter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    donation.status = status;
    await donation.save();
    res.status(200).json(donation);
  } catch (error) {
    serverError(res, error);
  }
};

// GET /api/donations/my-animals   (shelter / admin) - goal manage korar jonno
export const getMyAnimals = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { shelter: req.user._id };
    const animals = await Animal.find(filter).select("name photoUrl status sponsorGoal").lean();
    const map = await raisedMap(animals.map((a) => a._id));
    res.status(200).json(animals.map((a) => ({ ...a, ...progress(a, map[String(a._id)]) })));
  } catch (error) {
    serverError(res, error);
  }
};

// PATCH /api/donations/goal/:animalId   (shelter / admin) - sponsorGoal 0 = sponsorship off
export const setGoal = async (req, res) => {
  try {
    const goal = Number(req.body.sponsorGoal);
    if (!(goal >= 0)) return res.status(400).json({ message: "Invalid goal" });
    if (!isId(req.params.animalId)) return res.status(404).json({ message: "Animal not found" });

    const animal = await Animal.findById(req.params.animalId);
    if (!animal) return res.status(404).json({ message: "Animal not found" });
    if (req.user.role !== "admin" && animal.shelter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    animal.sponsorGoal = goal;
    await animal.save();
    res.status(200).json({ _id: animal._id, sponsorGoal: animal.sponsorGoal });
  } catch (error) {
    serverError(res, error);
  }
};
