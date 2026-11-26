import express from "express";
import {
  getSponsorPets,
  getWall,
  getShelters,
  getAnimalSponsor,
  createDonation,
  getMyDonations,
  getReceived,
  updateStatus,
  getMyAnimals,
  setGoal,
} from "../controllers/donationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// public
router.get("/sponsor-pets", getSponsorPets);
router.get("/wall", getWall);
router.get("/shelters", getShelters);
router.get("/animal/:animalId", getAnimalSponsor);

// logged-in
router.post("/", protect, createDonation);
router.get("/mine", protect, getMyDonations);

// shelter / admin  ("/:id" wala route sobar sheshe)
router.get("/received", protect, authorize("shelter", "admin"), getReceived);
router.get("/my-animals", protect, authorize("shelter", "admin"), getMyAnimals);
router.patch("/goal/:animalId", protect, authorize("shelter", "admin"), setGoal);
router.patch("/:id/status", protect, authorize("shelter", "admin"), updateStatus);

export default router;
