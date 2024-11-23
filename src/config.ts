// src/config.ts

import { ScreenshotOptions } from "./types";

export const DEFAULT_SCREENSHOT_OPTIONS: Partial<ScreenshotOptions> = {
  // Capture options
  format: "png",
  imageQuality: 80,
  captureBeyondViewport: true,
  fullPage: true,
  fullPageAlgorithm: "default",

  // Disallow certain resources
  blockAds: true,
  blockCookieBanners: true,
  blockBannersByHeuristics: true,
  blockTrackers: true,
  blockChats: true,

  // Wait and delay options
  delay: 0,
  timeout: 60,
  navigationTimeout: 30,
  waitUntil: ["networkidle2", "networkidle0"],

  // Styling options
  darkMode: false,
  reducedMotion: true,

  // Response Options
  metadataImageSize: true,
  metadataPageTitle: true,
  metadataContent: true,
  metadataHttpStatusCode: true,
};

export const R2_CONFIG = {
  CACHE_CONTROL: "public, max-age=31536000",
  CONTENT_TYPE_FALLBACK: "image/jpeg",
  TEXT_CONTENT_TYPE: "text/plain",
};
