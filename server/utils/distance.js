
export const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; 
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
 

export const withinRadius = (docs, lat, lng, radius) =>
  docs
    .map((d) => {
      const o = d.toObject ? d.toObject() : d; 
      return {
        ...o,
        distanceKm: Number(getDistanceKm(lat, lng, o.location.lat, o.location.lng).toFixed(1)),
      };
    })
    .filter((o) => o.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm);
