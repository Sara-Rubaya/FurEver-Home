import mongoose from "mongoose";

const lostFoundSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ["lost", "found"], required: true },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        petName: { type: String, trim: true, default: "", maxlength: 60 }, // found hole optional
        species: {
            type: String,
            enum: ["Dog", "Cat", "Bird", "Rabbit", "Other"],
            required: true,
        },
        breed: { type: String, trim: true, default: "", maxlength: 60 },
        color: { type: String, trim: true, default: "", maxlength: 40 },
        description: { type: String, required: true, trim: true, maxlength: 1000 },
        photoUrl: { type: String, required: true },
        contactPhone: { type: String, required: true, trim: true }, // shudhu logged-in user dekhbe
        location: {
            address: { type: String, required: true, trim: true },
            lat: { type: Number, default: 0 },
            lng: { type: Number, default: 0 },
        },
        eventDate: { type: Date, default: Date.now }, // kobe hariyeche / kobe paoa gese
        status: { type: String, enum: ["active", "reunited"], default: "active" },
        reunitedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

lostFoundSchema.index({ type: 1, species: 1, status: 1, createdAt: -1 });

export default mongoose.model("LostFound", lostFoundSchema);
