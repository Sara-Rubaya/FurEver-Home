import express from "express";
import { getNearbyVets, getAllVets, createVet, deleteVet } from "../controllers/vetControler.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
const router = express.Router();
// Public
router.get("/nearby", getNearbyVets); // "/:id" er age thakte hobe
router.get("/", getAllVets);
// Admin only
router.post("/", protect, authorize("admin"), createVet);
router.delete("/:id", protect, authorize("admin"), deleteVet);
export default router;