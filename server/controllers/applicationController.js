import Application from "../models/Application.js";
import Animal from "../models/Animal.js";

const ALLOWED_STATUSES = ["approved", "rejected", "pending"];

// what the animal's status becomes when an application changes status
const ANIMAL_STATUS_BY_DECISION = {
  approved: "adopted",
  rejected: "available",
  pending: "pending",
};

const serverError = (res, error) =>
  res.status(500).json({ message: "Server error", error: error.message });

export const createApplication = async (req, res) => {
  try {
    const { animalId, housingType, hasOtherPets, experience, message } = req.body;

    if (!animalId || !housingType || !experience) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const animal = await Animal.findById(animalId);
    if (!animal) return res.status(404).json({ message: "Animal not found" });

    if (animal.status !== "available") {
      return res.status(400).json({ message: "This animal is not available for adoption" });
    }

    const alreadyApplied = await Application.exists({ animal: animalId, adopter: req.user._id });
    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied for this animal" });
    }

    const application = await Application.create({
      animal: animalId,
      adopter: req.user._id,
      housingType,
      hasOtherPets,
      experience,
      message,
    });

    animal.status = "pending";
    await animal.save();

    res.status(201).json(application);
  } catch (error) {
    // duplicate key from the unique (animal + adopter) index
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already applied for this animal" });
    }
    serverError(res, error);
  }
};

export const getApplications = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "adopter") {
      query = { adopter: req.user._id };
    } else if (req.user.role === "shelter") {
      const myAnimalIds = await Animal.find({ shelter: req.user._id }).distinct("_id");
      query = { animal: { $in: myAnimalIds } };
    }
    // admin: no filter, sees everything

    const applications = await Application.find(query)
      .populate("animal")
      .populate("adopter", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    serverError(res, error);
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(req.params.id).populate("animal");
    if (!application) return res.status(404).json({ message: "Application not found" });

    const isOwner = application.animal.shelter.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = status;
    await application.save();

    await Animal.findByIdAndUpdate(application.animal._id, {
      status: ANIMAL_STATUS_BY_DECISION[status],
    });

    res.status(200).json(application);
  } catch (error) {
    serverError(res, error);
  }
};
