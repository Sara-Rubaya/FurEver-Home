import mongoose from "mongoose";
import LostFound from "../models/LostFound.js";
import { withinRadius } from "../utils/distance.js";
import { findMatches } from "../utils/lostFoundMatch.js";

const serverError = (res, error) =>
    res.status(500).json({ message: "Server error", error: error.message });

const notFound = (res) => res.status(404).json({ message: "Post not found" });
const canModify = (post, user) =>
    post.postedBy?.toString() === user._id.toString() || user.role === "admin";

// @route  GET /api/lost-found?type=&species=&search=&status=&lat=&lng=&radius=
// @desc   Public list - contactPhone pathano hoy na
export const getPosts = async (req, res) => {
    try {
        const { type, species, search, status = "active", lat, lng, radius } = req.query;
        const filter = {};

        if (["lost", "found"].includes(type)) filter.type = type;
        if (species) filter.species = species;
        if (status !== "all") filter.status = status;
        if (search?.trim()) {
            const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            filter.$or = [{ petName: re }, { breed: re }, { color: re }, { "location.address": re }];
        }

        let posts = await LostFound.find(filter).select("-contactPhone").sort({ createdAt: -1 }).lean();
        if (lat && lng && radius) posts = withinRadius(posts, Number(lat), Number(lng), Number(radius));

        res.status(200).json(posts);
    } catch (error) {
        serverError(res, error);
    }
};

// @route  GET /api/lost-found/mine   (logged-in)
export const getMyPosts = async (req, res) => {
    try {
        const posts = await LostFound.find({ postedBy: req.user._id }).sort({ createdAt: -1 }).lean();
        res.status(200).json(posts);
    } catch (error) {
        serverError(res, error);
    }
};

// @route  GET /api/lost-found/:id   (logged-in)
// @desc   Full details + contact phone + possible matches (opposite type, same species)
export const getPostById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

        const post = await LostFound.findById(req.params.id).populate("postedBy", "name").lean();
        if (!post) return notFound(res);

        let matches = [];
        if (post.status === "active") {
            const candidates = await LostFound.find({
                _id: { $ne: post._id },
                type: post.type === "lost" ? "found" : "lost",
                species: post.species,
                status: "active",
            })
                .select("-contactPhone")
                .lean();
            matches = findMatches(post, candidates);
        }

        const isOwner =
            post.postedBy?._id?.toString() === req.user._id.toString() ||
            req.user.role === "admin";
        res.status(200).json({ ...post, isOwner, matches });
    } catch (error) {
        serverError(res, error);
    }
};

// @route  POST /api/lost-found   (logged-in)
export const createPost = async (req, res) => {
    try {
        const { type, petName, species, breed, color, description, photoUrl, contactPhone, location, eventDate } =
            req.body;

        if (!type || !species || !description?.trim() || !photoUrl || !contactPhone?.trim() || !location?.address?.trim()) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const date = eventDate ? new Date(eventDate) : new Date();
        // Allow local date-only inputs (up to +14h timezone offset) while rejecting future dates
        const maxAllowedDate = new Date(Date.now() + 14 * 60 * 60 * 1000);
        if (Number.isNaN(date.getTime()) || date > maxAllowedDate) {
            return res.status(400).json({ message: "Date is invalid" });
        }

        const post = await LostFound.create({
            type,
            postedBy: req.user._id,
            petName,
            species,
            breed,
            color,
            description,
            photoUrl,
            contactPhone,
            location,
            eventDate: date,
        });

        res.status(201).json(post);
    } catch (error) {
        if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
        serverError(res, error);
    }
};

// @route  PATCH /api/lost-found/:id/reunite   (owner / admin)
export const markReunited = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

        const post = await LostFound.findById(req.params.id);
        if (!post) return notFound(res);
        if (!canModify(post, req.user)) return res.status(403).json({ message: "Not authorized" });

        post.status = "reunited";
        post.reunitedAt = new Date();
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        serverError(res, error);
    }
};

// @route  DELETE /api/lost-found/:id   (owner / admin)
export const deletePost = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

        const post = await LostFound.findById(req.params.id);
        if (!post) return notFound(res);
        if (!canModify(post, req.user)) return res.status(403).json({ message: "Not authorized" });

        await post.deleteOne();
        res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        serverError(res, error);
    }
};
