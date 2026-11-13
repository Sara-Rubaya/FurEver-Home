import mongoose from "mongoose";
import VetClinic from "../models/VetClinic.js";
import VetReview from "../models/VetReview.js";
import { escapeRegex, summarizeRatings, rankClinics } from "../utils/vetRatings.js";
 
// @route  GET /api/vets/directory?search=&emergency=true&minRating=4&sort=rating|reviews|name
// @desc   Public directory - prottek clinic-er avgRating ar reviewCount shoho
export const getDirectory = async (req, res) => {
  try {
    const { search, emergency, minRating, sort } = req.query;
    const filter = {};
 
    if (search) {
      const rx = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: rx }, { address: rx }, { services: rx }];
    }
    if (emergency === "true") filter.emergencyAvailable = true;
 
    const clinics = await VetClinic.find(filter).lean();
    const ids = clinics.map((c) => c._id);
 
    // (clinic, rating) onujayi group kore count - tarpor JS-e average ber kora
    const rows = await VetReview.aggregate([
      { $match: { clinic: { $in: ids } } },
      { $group: { _id: { clinic: "$clinic", rating: "$rating" }, count: { $sum: 1 } } },
    ]);
    const byClinic = {};
    for (const r of rows) (byClinic[r._id.clinic] ||= []).push({ _id: r._id.rating, count: r.count });
 
    const withStats = clinics.map((c) => {
      const { avgRating, reviewCount } = summarizeRatings(byClinic[c._id]);
      return { ...c, avgRating, reviewCount };
    });
 
    res.status(200).json(rankClinics(withStats, { sort, minRating }));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
 
// @route  GET /api/vets/:id
// @desc   Ekta clinic-er details + rating summary (average, count, 1-5 distribution)
export const getVetDetails = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Clinic not found" });
    }
    const clinic = await VetClinic.findById(req.params.id).lean();
    if (!clinic) return res.status(404).json({ message: "Clinic not found" });
 
    const rows = await VetReview.aggregate([
      { $match: { clinic: clinic._id } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);
 
    res.status(200).json({ ...clinic, ...summarizeRatings(rows) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
 
// @route  GET /api/vets/:id/reviews
export const getReviews = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Clinic not found" });
    }
    const reviews = await VetReview.find({ clinic: req.params.id })
      .populate("user", "name") // shudhu naam, email na
      .sort({ createdAt: -1 });
 
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
 
// @route  POST /api/vets/:id/reviews   (logged-in)
// @desc   Review create kore, ba ager review thakle update kore (upsert) - ekjon user-er ekta-i review
export const submitReview = async (req, res) => {
  try {
    const { id } = req.params;
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === "string" ? req.body.comment.trim() : "";
 
    if (!mongoose.isValidObjectId(id) || !(await VetClinic.exists({ _id: id }))) {
      return res.status(404).json({ message: "Clinic not found" });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be a whole number from 1 to 5" });
    }
    if (comment.length > 500) {
      return res.status(400).json({ message: "Comment must be 500 characters or less" });
    }
 
    const review = await VetReview.findOneAndUpdate(
      { clinic: id, user: req.user._id },
      { rating, comment },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
 
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
 
// @route  DELETE /api/vets/reviews/:reviewId   (review-er malik ba admin)
export const deleteReview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.reviewId)) {
      return res.status(404).json({ message: "Review not found" });
    }
    const review = await VetReview.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
 
    const isOwner = review.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }
 
    await review.deleteOne();
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
 
// @route  DELETE /api/vets/:id   (admin) - FR05-er deleteVet-er jaygay: clinic-er shathe tar review-o muche
export const deleteVetAndReviews = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Clinic not found" });
    }
    const clinic = await VetClinic.findByIdAndDelete(req.params.id);
    if (!clinic) return res.status(404).json({ message: "Clinic not found" });
 
    await VetReview.deleteMany({ clinic: clinic._id });
    res.status(200).json({ message: "Clinic and its reviews deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
