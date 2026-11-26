import mongoose from "mongoose";

// FR12 - Donation / Sponsor a Pet: animal thakle sponsorship, na thakle shelter ke general donation
const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shelter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    animal: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", default: null },
    amount: { type: Number, required: true, min: 10 }, // BDT
    method: { type: String, enum: ["bKash", "Nagad", "Card", "Bank"], required: true },
    transactionId: { type: String, required: true, trim: true },
    message: { type: String, trim: true, default: "", maxlength: 200 },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

// same transaction id duibar submit kora jabe na
donationSchema.index({ method: 1, transactionId: 1 }, { unique: true });
donationSchema.index({ shelter: 1, status: 1 });
donationSchema.index({ animal: 1, status: 1 });

export default mongoose.model("Donation", donationSchema);
