import express from "express";
import {
  getMyPassports,
  getPassportByAnimal,
  upsertPassportDetails,
  addVaccination,
  deleteVaccination,
  addMedicalRecord,
  deleteMedicalRecord,
} from "../controllers/healthPassportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authenticated dashboard listing for shelter, approved adopter, or admin
router.get("/my", protect, getMyPassports);

// Public read view (with optional auth for canEdit flag)
router.get("/animal/:animalId", getPassportByAnimal);

// Authorized updates (owning shelter, approved adopter, or admin)
router.put("/animal/:animalId", protect, upsertPassportDetails);
router.post("/animal/:animalId/vaccinations", protect, addVaccination);
router.delete("/animal/:animalId/vaccinations/:vaxId", protect, deleteVaccination);
router.post("/animal/:animalId/records", protect, addMedicalRecord);
router.delete("/animal/:animalId/records/:recordId", protect, deleteMedicalRecord);

export default router;
