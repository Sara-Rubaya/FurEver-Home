import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Animal from "../models/Animal.js";
import SuccessStory from "../models/SuccessStory.js";
import User from "../models/User.js";
import { buildStoryFilter, formatStory, sortStories } from "../utils/storyHelpers.js";

const EDITABLE_FIELDS = [
  "title",
  "petName",
  "species",
  "breed",
  "storyType",
  "story",
  "quote",
  "beforePhotoUrl",
  "afterPhotoUrl",
  "adoptionDate",
  "location",
  "shelterName",
];

const serverError = (res, error) =>
  res.status(500).json({ message: "Server error", error: error.message });

const resolveOptionalUserId = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id");
    return user?._id || null;
  } catch {
    return null;
  }
};

const loadPopulatedStory = (id) =>
  SuccessStory.findById(id)
    .populate("author", "name role")
    .populate("animal", "name species breed photoUrl");

const canModifyStory = (story, user) =>
  story.author.toString() === user._id.toString() || user.role === "admin";

// @route  GET /api/stories
export const getStories = async (req, res) => {
  try {
    const { species, storyType, featured, search, sort } = req.query;
    const filter = buildStoryFilter({ species, storyType, featured, search });

    const [docs, currentUserId] = await Promise.all([
      SuccessStory.find(filter)
        .populate("author", "name role")
        .populate("animal", "name species breed photoUrl")
        .lean(),
      resolveOptionalUserId(req),
    ]);

    const formatted = docs.map((doc) => formatStory(doc, currentUserId));
    const stories = sortStories(formatted, sort);

    const stats = {
      totalStories: stories.length,
      featuredCount: stories.filter((s) => s.isFeatured).length,
      totalLikes: stories.reduce((sum, s) => sum + s.likeCount, 0),
    };

    res.status(200).json({ stories, stats });
  } catch (error) {
    serverError(res, error);
  }
};

// @route  GET /api/stories/:id

export const getStoryById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Success story not found" });
    }

    const [story, currentUserId] = await Promise.all([
      loadPopulatedStory(req.params.id).lean(),
      resolveOptionalUserId(req),
    ]);
    if (!story) return res.status(404).json({ message: "Success story not found" });

    res.status(200).json(formatStory(story, currentUserId));
  } catch (error) {
    serverError(res, error);
  }
};

// @route  POST /api/stories

export const createStory = async (req, res) => {
  try {
    const {
      title,
      petName,
      species,
      breed,
      storyType,
      story,
      quote,
      beforePhotoUrl,
      afterPhotoUrl,
      adoptionDate,
      location,
      animalId,
      shelterName,
      isFeatured,
    } = req.body;

    if (!title?.trim() || !petName?.trim() || !story?.trim() || !afterPhotoUrl?.trim()) {
      return res.status(400).json({
        message: "Title, pet name, story, and after photo are required",
      });
    }

    let linkedAnimal = null;
    let resolvedShelterName = typeof shelterName === "string" ? shelterName.trim() : "";

    if (animalId) {
      if (!mongoose.isValidObjectId(animalId)) {
        return res.status(400).json({ message: "Invalid animal reference" });
      }
      linkedAnimal = await Animal.findById(animalId).populate("shelter", "name");
      if (!linkedAnimal) {
        return res.status(404).json({ message: "Referenced animal not found" });
      }
      if (!resolvedShelterName && linkedAnimal.shelter?.name) {
        resolvedShelterName = linkedAnimal.shelter.name;
      }
    }

    let parsedDate = null;
    if (adoptionDate) {
      parsedDate = new Date(adoptionDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Adoption date is invalid" });
      }
    }

    const created = await SuccessStory.create({
      title: title.trim(),
      petName: petName.trim(),
      species: species || linkedAnimal?.species || "Dog",
      breed: (typeof breed === "string" && breed.trim()) || linkedAnimal?.breed || "Mixed",
      storyType: storyType || "Adoption",
      story: story.trim(),
      quote: typeof quote === "string" ? quote.trim() : "",
      beforePhotoUrl: typeof beforePhotoUrl === "string" ? beforePhotoUrl.trim() : "",
      afterPhotoUrl: afterPhotoUrl.trim(),
      adoptionDate: parsedDate,
      location: typeof location === "string" ? location.trim() : "",
      animal: linkedAnimal?._id || null,
      author: req.user._id,
      authorDisplayName: req.user.name,
      shelterName: resolvedShelterName,
      isFeatured: req.user.role === "admin" ? Boolean(isFeatured) : false,
    });

    const populated = await loadPopulatedStory(created._id).lean();
    res.status(201).json(formatStory(populated, req.user._id));
  } catch (error) {
    serverError(res, error);
  }
};

// @route  PATCH /api/stories/:id
export const updateStory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Success story not found" });
    }

    const existing = await SuccessStory.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Success story not found" });

    if (!canModifyStory(existing, req.user)) {
      return res.status(403).json({ message: "Not authorized to edit this story" });
    }

    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] === undefined) continue;
      if (field === "adoptionDate") {
        if (!req.body.adoptionDate) {
          existing.adoptionDate = null;
        } else {
          const parsed = new Date(req.body.adoptionDate);
          if (Number.isNaN(parsed.getTime())) {
            return res.status(400).json({ message: "Adoption date is invalid" });
          }
          existing.adoptionDate = parsed;
        }
      } else {
        existing[field] =
          typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field];
      }
    }

    if (!existing.title || !existing.petName || !existing.story || !existing.afterPhotoUrl) {
      return res.status(400).json({
        message: "Title, pet name, story, and after photo cannot be empty",
      });
    }

    await existing.save();
    const populated = await loadPopulatedStory(existing._id).lean();
    res.status(200).json(formatStory(populated, req.user._id));
  } catch (error) {
    serverError(res, error);
  }
};

// @route  PATCH /api/stories/:id/like

export const toggleLikeStory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Success story not found" });
    }

    const existing = await SuccessStory.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Success story not found" });

    const userIdStr = req.user._id.toString();
    const alreadyLiked = existing.likes.some((id) => id.toString() === userIdStr);

    if (alreadyLiked) {
      existing.likes = existing.likes.filter((id) => id.toString() !== userIdStr);
    } else {
      existing.likes.push(req.user._id);
    }

    await existing.save();
    const populated = await loadPopulatedStory(existing._id).lean();
    res.status(200).json(formatStory(populated, req.user._id));
  } catch (error) {
    serverError(res, error);
  }
};

// @route  PATCH /api/stories/:id/feature

export const toggleFeatureStory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Success story not found" });
    }

    const existing = await SuccessStory.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Success story not found" });

    existing.isFeatured = !existing.isFeatured;
    await existing.save();

    const populated = await loadPopulatedStory(existing._id).lean();
    res.status(200).json(formatStory(populated, req.user._id));
  } catch (error) {
    serverError(res, error);
  }
};

// @route  DELETE /api/stories/:id

export const deleteStory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Success story not found" });
    }

    const existing = await SuccessStory.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Success story not found" });

    if (!canModifyStory(existing, req.user)) {
      return res.status(403).json({ message: "Not authorized to delete this story" });
    }

    await existing.deleteOne();
    res.status(200).json({ message: "Success story deleted" });
  } catch (error) {
    serverError(res, error);
  }
};
