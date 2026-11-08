import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    animal: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true },
    adopter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    housingType: { type: String, enum: ["Apartment", "House", "Other"], required: true },
    hasOtherPets: { type: Boolean, default: false },
    experience: { type: String, required: true, trim: true },
    message: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

// one adopter can apply to one animal only once
applicationSchema.index({ animal: 1, adopter: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
