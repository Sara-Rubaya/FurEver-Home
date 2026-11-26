import crypto from "crypto";

/**
 * Generates a unique FurEver Home passport identifier such as FH-2026-A1B2C3.
 */
export const generatePassportNumber = () => {
  const year = new Date().getFullYear();
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `FH-${year}-${suffix}`;
};

/**
 * Normalizes a comma-separated string or array into a deduplicated list of trimmed strings.
 */
export const normalizeTagList = (value) => {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
    ? value.split(",")
    : [];

  const cleaned = raw
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  return [...new Set(cleaned)];
};

/**
 * Parses a date input and returns a valid Date or null when empty/invalid.
 */
export const parseOptionalDate = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "INVALID" : parsed;
};

/**
 * Computes a vaccination status summary for an array of vaccinations.
 */
export const summarizePassportHealth = (passport, now = new Date()) => {
  if (!passport) {
    return {
      hasPassport: false,
      vaccinationCount: 0,
      medicalRecordCount: 0,
      overdueCount: 0,
      dueSoonCount: 0,
    };
  }

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  let overdueCount = 0;
  let dueSoonCount = 0;

  for (const vax of passport.vaccinations || []) {
    if (!vax.nextDueDate) continue;
    const due = new Date(vax.nextDueDate);
    if (Number.isNaN(due.getTime())) continue;

    if (due < startOfToday) {
      overdueCount += 1;
    } else if (due.getTime() - startOfToday.getTime() <= thirtyDaysMs) {
      dueSoonCount += 1;
    }
  }

  return {
    hasPassport: true,
    vaccinationCount: passport.vaccinations?.length || 0,
    medicalRecordCount: passport.medicalRecords?.length || 0,
    overdueCount,
    dueSoonCount,
  };
}
