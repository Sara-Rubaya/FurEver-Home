import mongoose from "mongoose";
 
// FR08 - Vet clinic review. Ekjon user ekta clinic-e ekbar-i review dite pare (unique index).
const vetReviewSchema = new mongoose.Schema(
  {
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: "VetClinic", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { timestamps: true }
);
 
vetReviewSchema.index({ clinic: 1, user: 1 }, { unique: true });
 
export default mongoose.model("VetReview", vetReviewSchema);
