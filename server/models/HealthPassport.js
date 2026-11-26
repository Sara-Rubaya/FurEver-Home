import mongoose from "mongoose";

// FR09 - Pet Health Passport: vaccination logs, medical history, and baseline health metadata per animal
const vaccinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    dateAdministered: { type: Date, required: true },
    nextDueDate: { type: Date, default: null },
    vetName: { type: String, trim: true, default: "", maxlength: 100 },
    clinicName: { type: String, trim: true, default: "", maxlength: 120 },
    batchNumber: { type: String, trim: true, default: "", maxlength: 60 },
    notes: { type: String, trim: true, default: "", maxlength: 300 },
  },
  { _id: true, timestamps: true }
);

const medicalRecordSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    recordType: {
      type: String,
      enum: ["Checkup", "Treatment", "Surgery", "Deworming", "Lab Test", "Emergency", "Other"],
      default: "Checkup",
    },
    date: { type: Date, required: true },
    vetName: { type: String, trim: true, default: "", maxlength: 100 },
    clinicName: { type: String, trim: true, default: "", maxlength: 120 },
    diagnosis: { type: String, trim: true, default: "", maxlength: 300 },
    medication: { type: String, trim: true, default: "", maxlength: 300 },
    notes: { type: String, trim: true, default: "", maxlength: 500 },
  },
  { _id: true, timestamps: true }
);

const healthPassportSchema = new mongoose.Schema(
  {
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true,
      unique: true,
    },
    passportNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    microchipId: { type: String, trim: true, default: "", maxlength: 60 },
    bloodGroup: { type: String, trim: true, default: "", maxlength: 30 },
    weightKg: { type: Number, min: 0, default: null },
    spayedNeutered: { type: Boolean, default: false },
    allergies: { type: [String], default: [] },
    chronicConditions: { type: [String], default: [] },
    dietaryNotes: { type: String, trim: true, default: "", maxlength: 400 },
    emergencyVetContact: {
      clinicName: { type: String, trim: true, default: "", maxlength: 120 },
      phone: { type: String, trim: true, default: "", maxlength: 40 },
    },
    vaccinations: { type: [vaccinationSchema], default: [] },
    medicalRecords: { type: [medicalRecordSchema], default: [] },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("HealthPassport", healthPassportSchema);
