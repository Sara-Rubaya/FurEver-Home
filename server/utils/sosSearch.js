import { withinRadius } from "./distance.js";
 

export const searchContacts = (clinics, rescuers, lat, lng, radius) => {
  let radiusKm = radius;
  let vets = withinRadius(clinics, lat, lng, radiusKm);
  let people = withinRadius(rescuers, lat, lng, radiusKm);
  let expanded = false;
 
  if (vets.length === 0 && people.length === 0) {
    radiusKm = Math.min(radius * 3, 100);
    expanded = true;
    vets = withinRadius(clinics, lat, lng, radiusKm);
    people = withinRadius(rescuers, lat, lng, radiusKm);
  }
 
  return { vets, rescuers: people, radiusKm, expanded };
};
