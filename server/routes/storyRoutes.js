import express from "express";
import {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  toggleLikeStory,
  toggleFeatureStory,
  deleteStory,
} from "../controllers/storyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getStories);
router.get("/:id", getStoryById);

// Authenticated user routes
router.post("/", protect, createStory);
router.patch("/:id", protect, updateStory);
router.patch("/:id/like", protect, toggleLikeStory);
router.delete("/:id", protect, deleteStory);

// Admin spotlight toggle
router.patch("/:id/feature", protect, authorize("admin"), toggleFeatureStory);

export default router;
