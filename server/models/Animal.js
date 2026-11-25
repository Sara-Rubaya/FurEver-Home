import mongoose from "mongoose";

const animalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    species: { type: String, required: true, trim: true },
    breed: { type: String, trim: true, default: "Mixed" },
    age: { type: Number, required: true, min: 0 },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    size: { type: String, enum: ["Small", "Medium", "Large"], default: "Medium" },
    description: { type: String, required: true, trim: true },
    healthStatus: { type: String, trim: true, default: "Vaccinated" },
    temperament: { type: String, trim: true, default: "Friendly" },
    photoUrl: { type: String, required: true },
    status: { type: String, enum: ["available", "pending", "adopted"], default: "available" },
    shelter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// faster lookups for the listing page and the shelter dashboard
animalSchema.index({ status: 1, shelter: 1 });

export default mongoose.model("Animal", animalSchema);
