import express from "express";
import { getNearbyVets, getAllVets, createVet } from "../controllers/vetController.js";
import {
  getDirectory,
  getVetDetails,
  getReviews,
  submitReview,
  deleteReview,
  deleteVetAndReviews,
} from "../controllers/vetDirectoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
 
const router = express.Router();
 
// Public - "/:id" er age specific route gulo thakte hobe
router.get("/nearby", getNearbyVets); // FR05
router.get("/directory", getDirectory); // FR08
router.get("/", getAllVets); // FR05 fallback
 
// Review delete (malik ba admin)
router.delete("/reviews/:reviewId", protect, deleteReview);
 
// Public - clinic details + reviews
router.get("/:id", getVetDetails);
router.get("/:id/reviews", getReviews);
 
// Logged-in user review dibe / update korbe
router.post("/:id/reviews", protect, submitReview);
 
// Admin only
router.post("/", protect, authorize("admin"), createVet);
router.delete("/:id", protect, authorize("admin"), deleteVetAndReviews);
 
export default router;
