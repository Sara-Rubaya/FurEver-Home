export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 
// rows: [{ _id: <rating 1-5>, count: <koyta> }] -> average, total, distribution
export const summarizeRatings = (rows = []) => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let sum = 0;
  for (const { _id, count } of rows) {
    if (distribution[_id] !== undefined) {
      distribution[_id] += count;
      total += count;
      sum += _id * count;
    }
  }
  return {
    avgRating: total ? Number((sum / total).toFixed(1)) : 0,
    reviewCount: total,
    distribution,
  };
};
 
// minRating diye filter + sort (rating / reviews / name)
export const rankClinics = (clinics, { sort = "name", minRating = 0 } = {}) => {
  const min = Number(minRating) || 0;
  const list = clinics.filter((c) => c.avgRating >= min);
  const byName = (a, b) => a.name.localeCompare(b.name);
 
  if (sort === "rating") {
    return list.sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount || byName(a, b));
  }
  if (sort === "reviews") {
    return list.sort((a, b) => b.reviewCount - a.reviewCount || b.avgRating - a.avgRating || byName(a, b));
  }
  return list.sort(byName);
};
