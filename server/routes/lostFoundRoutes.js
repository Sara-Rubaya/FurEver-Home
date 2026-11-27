import express from "express";
import {
    getPosts,
    getMyPosts,
    getPostById,
    createPost,
    markReunited,
    deletePost,
} from "../controllers/lostFoundController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPosts); // public
router.get("/mine", protect, getMyPosts); // "/:id" er age thakte hobe
router.get("/:id", protect, getPostById);
router.post("/", protect, createPost);
router.patch("/:id/reunite", protect, markReunited);
router.delete("/:id", protect, deletePost);

export default router;
