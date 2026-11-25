import Animal from "../models/Animal.js";

const EDITABLE_FIELDS = [
  "name", "species", "breed", "age", "gender", "size",
  "description", "healthStatus", "temperament", "photoUrl",
];

const serverError = (res, error) =>
  res.status(500).json({ message: "Server error", error: error.message });

const canManage = (animal, user) =>
  animal.shelter.toString() === user._id.toString() || user.role === "admin";

export const createAnimal = async (req, res) => {
  try {
    const { name, species, breed, age, gender, size, description, healthStatus, temperament, photoUrl } = req.body;

    if (!name || !species || age === undefined || age === "" || !gender || !description || !photoUrl) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const animal = await Animal.create({
      name, species, breed, age, gender, size, description, healthStatus, temperament, photoUrl,
      shelter: req.user._id,
    });

    res.status(201).json(animal);
  } catch (error) {
    serverError(res, error);
  }
};

// NOTE: basic version - only filters by status and shelter.
// The "Search & Filter" branch will extend this (species/gender/size/age/search/sort).
export const getAnimals = async (req, res) => {
  try {
    const { status, shelter } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (shelter) filter.shelter = shelter;

    const animals = await Animal.find(filter)
      .populate("shelter", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(animals);
  } catch (error) {
    serverError(res, error);
  }
};

export const getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id).populate("shelter", "name email");
    if (!animal) return res.status(404).json({ message: "Animal not found" });

    res.status(200).json(animal);
  } catch (error) {
    serverError(res, error);
  }
};

export const updateAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ message: "Animal not found" });

    if (!canManage(animal, req.user)) {
      return res.status(403).json({ message: "Not authorized to edit this listing" });
    }

    // only allow known fields so status/shelter can't be changed from the request body
    EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) animal[field] = req.body[field];
    });

    await animal.save();
    res.status(200).json(animal);
  } catch (error) {
    serverError(res, error);
  }
};

export const deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ message: "Animal not found" });

    if (!canManage(animal, req.user)) {
      return res.status(403).json({ message: "Not authorized to delete this listing" });
    }

    await animal.deleteOne();
    res.status(200).json({ message: "Animal listing deleted" });
  } catch (error) {
    serverError(res, error);
  }
};
