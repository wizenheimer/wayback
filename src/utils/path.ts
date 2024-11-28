// src/utils/path.ts

import { createHash } from "crypto";

export const generatePathHash = (url: string): string => {
  return createHash("sha256").update(url).digest("hex").substring(0, 32);
};

export const getWeekNumber = (date: Date = new Date()): string => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return weekNumber.toString().padStart(2, "0");
};
