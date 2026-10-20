import Animal from "../models/Animal.js";
import Application from "../models/Application.js";

// @route  GET /api/shelter/stats
// @desc   Logged-in shelter-er nijer animal/application-er summary count
export const getShelterStats = async (req, res) => {
  try {
    const shelterId = req.user._id;

    const [totalAnimals, available, pending, adopted] = await Promise.all([
      Animal.countDocuments({ shelter: shelterId }),
      Animal.countDocuments({ shelter: shelterId, status: "available" }),
      Animal.countDocuments({ shelter: shelterId, status: "pending" }),
      Animal.countDocuments({ shelter: shelterId, status: "adopted" }),
    ]);

    // Application count korte hole age nijer animal-gulor id ber korte hobe
    const myAnimalIds = await Animal.find({ shelter: shelterId }).distinct("_id");

    const [pendingApplications, totalApplications] = await Promise.all([
      Application.countDocuments({ animal: { $in: myAnimalIds }, status: "pending" }),
      Application.countDocuments({ animal: { $in: myAnimalIds } }),
    ]);

    res.status(200).json({
      animals: { total: totalAnimals, available, pending, adopted },
      applications: { total: totalApplications, pending: pendingApplications },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};