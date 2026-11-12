import VetClinic from "../models/VetClinc.js";

// Haversine formula - dui coordinate-er moddhe shoja doori (km) ber kore
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
const R = 6371; // Earth radius in km
const toRad = (deg) => (deg * Math.PI) / 180;
const dLat = toRad(lat2 - lat1);
const dLng = toRad(lng2 - lng1);
const a =
Math.sin(dLat / 2) ** 2 +
Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
// @route GET /api/vets/nearby?lat=23.8&amp;lng=90.4&amp;radius=10&amp;emergency=true
// @desc User-er location theke radius (km) er moddhe vet clinic, kacher gulo age
export const getNearbyVets = async (req, res) => {
try {
const lat = parseFloat(req.query.lat);
const lng = parseFloat(req.query.lng);
const radius = Math.min(parseFloat(req.query.radius) || 10, 100); // max 100 km
const emergencyOnly = req.query.emergency === "true";
if (Number.isNaN(lat) || Number.isNaN(lng)) {
return res.status(400).json({ message: "Valid lat and lng are required" });
}
const filter = emergencyOnly ? { emergencyAvailable: true } : {};
const clinics = await VetClinic.find(filter);
const nearby = clinics
.map((c) => ({
...c.toObject(),
distanceKm: Number(getDistanceKm(lat, lng, c.location.lat, c.location.lng).toFixed(1)),
}))
.filter((c) => c.distanceKm <= radius)
.sort((a, b) => a.distanceKm - b.distanceKm);
res.status(200).json(nearby);
} catch (error) {
res.status(500).json({ message: "Server error", error: error.message });
}
};
// @route GET /api/vets
// @desc Location na pele fallback - shob clinic
export const getAllVets = async (req, res) => {
try {
const clinics = await VetClinic.find().sort({ name: 1 });
res.status(200).json(clinics);
} catch (error) {
res.status(500).json({ message: "Server error", error: error.message });
}
};
// @route POST /api/vets (admin only)
export const createVet = async (req, res) => {
try {
const { name, address, location, phone, openingHours, services, emergencyAvailable } = req.body;
if (!name || !address || !phone || location?.lat == null || location?.lng == null) {

return res.status(400).json({ message: "name, address, phone and location (lat, lng) are required" });
}
const clinic = await VetClinic.create({
name, address, location, phone, openingHours, services, emergencyAvailable,
});
res.status(201).json(clinic);
} catch (error) {
res.status(500).json({ message: "Server error", error: error.message });
}
};
// @route DELETE /api/vets/:id (admin only)
export const deleteVet = async (req, res) => {
try {
const clinic = await VetClinic.findByIdAndDelete(req.params.id);
if (!clinic) return res.status(404).json({ message: "Clinic not found" });
res.status(200).json({ message: "Clinic deleted" });
} catch (error) {
res.status(500).json({ message: "Server error", error: error.message });
}
};