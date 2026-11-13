import VetClinic from "../models/VetClinic.js";
import User from "../models/User.js";
import { searchContacts } from "../utils/sosSearch.js";
 

export const getSosContacts = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = Math.min(parseFloat(req.query.radius) || 10, 100);
 
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: "Valid lat and lng are required" });
    }
 
    const [clinics, rescuers] = await Promise.all([
      VetClinic.find(),
      
      User.find({
        role: "shelter",
        isVerified: true,
        phone: { $ne: "" },
        "location.lat": { $ne: null },
        "location.lng": { $ne: null },
      }).select("name phone address location"),
    ]);
 
    res.status(200).json(searchContacts(clinics, rescuers, lat, lng, radius));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
