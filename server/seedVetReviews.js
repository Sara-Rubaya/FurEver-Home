import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "./models/User.js";
import VetClinic from "./models/VetClinic.js";
import VetReview from "./models/VetReview.js";
 
dotenv.config();
 
// DEMO - "Demo ..." naamer clinic-gulor jonno fictional reviewer ar review (seedVets.js age chalate hobe)
const reviewers = [1, 2, 3, 4].map((n) => ({
  name: `Demo Reviewer ${n}`,
  email: `demo.reviewer${n}@example.com`,
}));
 
const ratingPatterns = [[5, 4, 5, 4], [3, 4, 2], [5, 5, 4, 5], [4, 3], [2, 3, 3, 4], [5]];
const comments = {
  5: "Excellent care, the vet was gentle and very professional.",
  4: "Good service and reasonable price. Would visit again.",
  3: "Okay experience, but we had to wait quite a while.",
  2: "Staff was nice but the clinic was crowded and slow.",
};
 
const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
 
  const clinics = await VetClinic.find({ name: /^Demo / }).sort({ name: 1 });
  if (clinics.length === 0) {
    console.log("No demo clinics found - age node seedVets.js chalao");
    process.exit();
  }
 
  const users = [];
  for (const r of reviewers) {
    let u = await User.findOne({ email: r.email });
    if (!u) {
      const password = await bcrypt.hash(crypto.randomUUID(), 10); // random, login kora jabe na
      u = await User.create({ ...r, password, role: "adopter" });
    }
    users.push(u);
  }
 
  let count = 0;
  for (const [i, clinic] of clinics.entries()) {
    const pattern = ratingPatterns[i % ratingPatterns.length];
    for (const [j, rating] of pattern.entries()) {
      await VetReview.updateOne(
        { clinic: clinic._id, user: users[j]._id },
        { $set: { rating, comment: comments[rating] } },
        { upsert: true }
      );
      count++;
    }
  }
 
  console.log(`${count} demo reviews added/updated for ${clinics.length} clinics`);
  process.exit();
};
 
seed();
