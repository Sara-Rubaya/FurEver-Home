import mongoose from "mongoose";

// FR10 - Success Stories Wall: community adoption & rescue testimonials with optional Before/After photos and likes
const successStorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    petName: { type: String, required: true, trim: true, maxlength: 60 },
    species: {
      type: String,
      enum: ["Dog", "Cat", "Bird", "Rabbit", "Other"],
      default: "Dog",
    },
    breed: { type: String, trim: true, default: "Mixed", maxlength: 60 },
    storyType: {
      type: String,
      enum: ["Adoption", "Rescue & Recovery", "Foster to Forever", "Medical Miracle"],
      default: "Adoption",
    },
    story: { type: String, required: true, trim: true, maxlength: 2000 },
    quote: { type: String, trim: true, default: "", maxlength: 240 },
    beforePhotoUrl: { type: String, trim: true, default: "" },
    afterPhotoUrl: { type: String, required: true, trim: true },
    adoptionDate: { type: Date, default: null },
    location: { type: String, trim: true, default: "", maxlength: 100 },
    animal: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorDisplayName: { type: String, trim: true, default: "", maxlength: 80 },
    shelterName: { type: String, trim: true, default: "", maxlength: 100 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

successStorySchema.index({ isFeatured: -1, createdAt: -1 });
successStorySchema.index({ species: 1, storyType: 1 });

export default mongoose.model("SuccessStory", successStorySchema);
