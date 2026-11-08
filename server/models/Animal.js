import mongoose from "mongoose";


const animalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      required: true,
      trim: true,
    },
    breed: {
      type: String,
      default: "Mixed",
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    size: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      default: "Medium",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    healthStatus: {
      type: String,
      default: "Vaccinated",
    },
    temperament: {
      type: String,
      default: "Friendly",
    },
    photoUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "pending", "adopted"],
      default: "available",
    },
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


const Animal = mongoose.model("Animal", animalSchema);


export default Animal;