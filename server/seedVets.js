import mongoose from "mongoose";
import dotenv from "dotenv";
import VetClinic from "./models/VetClinic.js";
 
dotenv.config();
 
// DEMO data - naam/phone fictional, coordinates Dhaka area-r. Real clinic data diye replace koro.
const demoClinics = [
  { name: "Demo Pet Care Clinic – Mirpur", address: "Mirpur 10, Dhaka", location: { lat: 23.8069, lng: 90.3687 }, phone: "01700-000001", openingHours: "9:00 AM – 9:00 PM", services: "Vaccination, Surgery, Check-up", emergencyAvailable: true },
  { name: "Demo Animal Hospital – Dhanmondi", address: "Dhanmondi 27, Dhaka", location: { lat: 23.7561, lng: 90.374 }, phone: "01700-000002", openingHours: "10:00 AM – 8:00 PM", services: "Vaccination, Dental, Grooming", emergencyAvailable: false },
  { name: "Demo Vet Point – Gulshan", address: "Gulshan 1, Dhaka", location: { lat: 23.7806, lng: 90.4163 }, phone: "01700-000003", openingHours: "24 hours", services: "Emergency Care, Surgery, X-ray", emergencyAvailable: true },
  { name: "Demo Pet Clinic – Uttara", address: "Uttara Sector 7, Dhaka", location: { lat: 23.8759, lng: 90.3795 }, phone: "01700-000004", openingHours: "9:00 AM – 7:00 PM", services: "Vaccination, Check-up", emergencyAvailable: false },
  { name: "Demo Vet Care – Mohammadpur", address: "Mohammadpur, Dhaka", location: { lat: 23.7662, lng: 90.3586 }, phone: "01700-000005", openingHours: "10:00 AM – 9:00 PM", services: "Vaccination, Surgery, Emergency Care", emergencyAvailable: true },
  { name: "Demo Animal Clinic – Savar", address: "Savar Bazar, Dhaka", location: { lat: 23.8583, lng: 90.2667 }, phone: "01700-000006", openingHours: "9:00 AM – 6:00 PM", services: "Vaccination, Livestock Care", emergencyAvailable: false },
];
 
const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
 
  const count = await VetClinic.countDocuments();
  if (count > 0) {
    console.log(`Already ${count} clinics exist - skipping seed`);
    process.exit();
  }
 
  await VetClinic.insertMany(demoClinics);
  console.log(`${demoClinics.length} demo clinics added`);
  process.exit();
};
 
seed();
