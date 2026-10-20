import express from "express";
import { getShelterStats } from "../controllers/shelterController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/stats", protect, authorize("shelter"), getShelterStats);

export default router;