import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "./models/User.js";
 
dotenv.config();
 
// DEMO rescuer - naam/phone fictional, coordinates Dhaka area-r (approximate).
// Password random, tai ei account diye login kora jabe na - shudhu SOS list-e dekhanor jonno.
const demoRescuers = [
  { name: "Demo Rescue Team – Mirpur", email: "demo.rescuer.mirpur@example.com", phone: "01800-000001", address: "Mirpur 12, Dhaka", location: { lat: 23.828, lng: 90.364 } },
  { name: "Demo Animal Rescuers – Dhanmondi", email: "demo.rescuer.dhanmondi@example.com", phone: "01800-000002", address: "Dhanmondi 15, Dhaka", location: { lat: 23.7465, lng: 90.376 } },
  { name: "Demo Paw Rescue – Uttara", email: "demo.rescuer.uttara@example.com", phone: "01800-000003", address: "Uttara Sector 10, Dhaka", location: { lat: 23.8697, lng: 90.3989 } },
];
 
const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
 
  let added = 0;
  for (const r of demoRescuers) {
    const exists = await User.findOne({ email: r.email });
    if (exists) continue;
 
    const password = await bcrypt.hash(crypto.randomUUID(), 10);
    await User.create({ ...r, password, role: "shelter", isVerified: true });
    added++;
  }
 
  console.log(`${added} demo rescuers added`);
  process.exit();
};
 
seed();
