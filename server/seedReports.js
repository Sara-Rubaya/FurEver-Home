import mongoose from "mongoose";
import dotenv from "dotenv";
import Report from "./models/Report.js";
import User from "./models/User.js";
 
dotenv.config();
 
// DEMO report - Dhaka area-r coordinates. Description-er shuru-te [Demo] likha, jate chinte pari.
const demoReports = [
  { animalType: "Dog", description: "[Demo] Injured leg, limping near the bus stand", photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600", location: { address: "Mirpur 10, Dhaka", lat: 23.8069, lng: 90.3687 }, status: "pending" },
  { animalType: "Cat", description: "[Demo] Stuck in a drain, meowing continuously", photoUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600", location: { address: "Dhanmondi 27, Dhaka", lat: 23.7561, lng: 90.374 }, status: "in-progress" },
  { animalType: "Dog", description: "[Demo] Puppies abandoned near a dustbin (now safe)", photoUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600", location: { address: "Gulshan 1, Dhaka", lat: 23.7806, lng: 90.4163 }, status: "rescued" },
  { animalType: "Cat", description: "[Demo] Weak and not eating, hiding under a car", photoUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600", location: { address: "Uttara Sector 7, Dhaka", lat: 23.8759, lng: 90.3795 }, status: "pending" },
  { animalType: "Rabbit", description: "[Demo] Found in the park, rescued by a volunteer", photoUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600", location: { address: "Mohammadpur, Dhaka", lat: 23.7662, lng: 90.3586 }, status: "rescued" },
];
 
const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
 
  const existing = await Report.countDocuments({ description: /^\[Demo\]/ });
  if (existing > 0) {
    console.log(`Already ${existing} demo reports exist - skipping seed`);
    process.exit();
  }
 
  const user = await User.findOne(); // reportedBy hisebe je kono ekta user
  if (!user) {
    console.log("No user found - age ekta account register koro");
    process.exit();
  }
 
  await Report.insertMany(
    demoReports.map((r) => ({
      ...r,
      reportedBy: user._id,
      assignedTo: r.status === "pending" ? null : user._id,
    }))
  );
  console.log(`${demoReports.length} demo reports added`);
  process.exit();
};
 
seed();
