// src/utils/path.ts

import { createHash } from "crypto";

// Helper to get content path
export const generatePathHash = (url: string): string => {
  return createHash("sha256").update(url).digest("hex").substring(0, 32);
};

// Helper to get date path
export const getDatePath = (): string => {
  const now = new Date();
  return `${now.getDate().toString().padStart(2, "0")}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getFullYear()}`;
};
