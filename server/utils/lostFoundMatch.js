import { getDistanceKm } from "./distance.js";

const hasCoords = (loc) => Boolean(loc?.lat && loc?.lng);
const like = (a, b) => {
    if (!a || !b) return false;
    const x = a.toLowerCase().trim();
    const y = b.toLowerCase().trim();
    return x.includes(y) || y.includes(x);
};

// Score: color +3, breed +2, distance (<=5km +3, <=15km +1), date gap (<=7d +2, <=30d +1)
export const scoreMatch = (a, b) => {
    let score = 0;
    if (like(a.color, b.color)) score += 3;
    if (like(a.breed, b.breed)) score += 2;

    if (hasCoords(a.location) && hasCoords(b.location)) {
        const km = getDistanceKm(a.location.lat, a.location.lng, b.location.lat, b.location.lng);
        if (km <= 5) score += 3;
        else if (km <= 15) score += 1;
    }

    const days = Math.abs(new Date(a.eventDate) - new Date(b.eventDate)) / 86400000;
    if (days <= 7) score += 2;
    else if (days <= 30) score += 1;

    return score;
};

// Kom-pokkhe 2 ta signal mile gele match hishebe dekhabe
export const findMatches = (post, candidates, limit = 5) =>
    candidates
        .map((c) => ({ ...c, matchScore: scoreMatch(post, c) }))
        .filter((c) => c.matchScore >= 4)
        .sort((x, y) => y.matchScore - x.matchScore)
        .slice(0, limit);
