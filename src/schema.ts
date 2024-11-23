// src/schema.ts

import { z } from "zod";
import { BlockableResources, Timezones, IpCountries } from "./types";

const clipSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  })
  .optional();

const waitUntilSchema = z.enum([
  "load",
  "domcontentloaded",
  "networkidle0",
  "networkidle2",
]);

const waitForSelectorAlgorithmSchema = z.enum([
  "at_least_one",
  "at_least_by_count",
]);

const blockResourceTypeSchema = z.enum(
  Object.values(BlockableResources) as [string, ...string[]]
);

const timezoneSchema = z.enum(
  Object.values(Timezones) as [string, ...string[]]
);

const ipCountrySchema = z.enum(
  Object.values(IpCountries) as [string, ...string[]]
);

const fullPageAlgorithmSchema = z.enum(["by_sections", "default"]);

// Main screenshot schema
const screenshotSchema = z
  .object({
    // Target Options
    url: z.string().url(),

    // Selector Options
    selector: z.string().optional(),
    scrollIntoView: z.string().optional(),
    adjustTop: z.number().optional(),
    captureBeyondViewport: z.boolean().optional(),

    // Capture Options
    fullPage: z.boolean().optional(),
    fullPageScroll: z.boolean().optional(),
    fullPageAlgorithm: fullPageAlgorithmSchema.optional(),
    scrollDelay: z.number().min(0).optional(),
    scrollBy: z.number().optional(),
    maxHeight: z.number().min(0).optional(),
    format: z.enum(["jpg", "png", "webp"]).optional(),
    imageQuality: z.number().min(0).max(100).optional(),
    omitBackground: z.boolean().optional(),

    // Clip Options
    clip: clipSchema,

    // Resource Blocking Options
    blockAds: z.boolean().optional(),
    blockCookieBanners: z.boolean().optional(),
    blockBannersByHeuristics: z.boolean().optional(),
    blockTrackers: z.boolean().optional(),
    blockChats: z.boolean().optional(),
    blockRequests: z.array(z.string()).optional(),
    blockResources: z.array(blockResourceTypeSchema).optional(),

    // Media Options
    darkMode: z.boolean().optional(),
    reducedMotion: z.boolean().optional(),

    // Request Options
    userAgent: z.string().optional(),
    authorization: z.string().optional(),
    headers: z.record(z.string()).optional(),
    cookies: z.array(z.string()).optional(),
    timezone: timezoneSchema.optional(),
    bypassCSP: z.boolean().optional(),
    ipCountryCode: ipCountrySchema.optional(),

    // Wait and Delay Options
    delay: z.number().min(0).optional(),
    timeout: z.number().min(0).optional(),
    navigationTimeout: z.number().min(0).optional(),
    waitForSelector: z.string().optional(),
    waitForSelectorAlgorithm: waitForSelectorAlgorithmSchema.optional(),
    waitUntil: z.array(waitUntilSchema).optional(),

    // Interaction Options
    click: z.string().optional(),
    failIfClickNotFound: z.boolean().optional(),
    hideSelectors: z.array(z.string()).optional(),
    styles: z.string().optional(),
    scripts: z.string().optional(),
    scriptWaitUntil: z.array(waitUntilSchema).optional(),

    // Metadata Options
    metadataImageSize: z.boolean().optional(),
    metadataPageTitle: z.boolean().optional(),
    metadataContent: z.boolean().optional(),
    metadataHttpStatusCode: z.boolean().optional(),
    metadataHttpHeaders: z.boolean().optional(),
  })
  .strict();

const getScreenshotSchema = z.object({
  hash: z.string(),
  date: z.string().length(8).regex(/^\d+$/), // Validate DDMMYYYY format
  format: z.enum(["base64", "binary", "json"]).default("base64"),
});

const getScreenshotQuerySchema = z.object({
  format: z.enum(["base64", "binary", "json"]).default("base64"),
});

const getScreenshotParamSchema = z.object({
  hash: z.string(),
  date: z.string().length(8).regex(/^\d+$/),
});

export {
  getScreenshotSchema,
  getScreenshotParamSchema,
  getScreenshotQuerySchema,
  screenshotSchema,
};
