// src/schema.ts

import { z } from "zod";
import { BlockableResources, IpCountries, Timezones } from "./types/screenshot";

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

    runId: z.string(), // Required field for identifying the capture

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
  weekNumber: z.string().length(2).regex(/^\d+$/),
  runId: z.string(),
});

const diffRequestSchema = z.object({
  url: z.string().url(),
  runId1: z.string(),
  runId2: z.string(),
});

const historyQuerySchema = z.object({
  url: z.string().url(),
  fromRunId: z.string().optional(),
  toRunId: z.string().optional(),
  weekNumber: z.string().length(2).regex(/^\d+$/).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

const categoryBaseSchema = z.object({
  changes: z.array(z.string()),
  urls: z.record(z.array(z.string())),
});

const categoryEnrichedSchema = categoryBaseSchema.extend({
  summary: z.string(),
});

const reportRequestSchema = z
  .object({
    urls: z.array(z.string().url()).min(1).max(100),
    runId1: z.string().optional(),
    runId2: z.string().optional(),
    weekNumber: z.string().length(2).regex(/^\d+$/).optional(),
    competitor: z.string().min(1, "Competitor name is required"),
    enriched: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (data.runId1 && data.runId2) {
        return data.runId1 <= data.runId2;
      }
      return true;
    },
    {
      message: "runId1 must be earlier than or equal to runId2",
    }
  );

export const competitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().min(1, "Domain is required"),
  urls: z
    .array(z.string().url("Invalid URL"))
    .min(1, "At least one URL is required"),
});

export const updateCompetitorSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  domain: z.string().min(1, "Domain is required").optional(),
  urls: z
    .array(z.string().url("Invalid URL"))
    .min(1, "At least one URL is required")
    .optional(),
});

type CreateCompetitorInput = z.infer<typeof competitorSchema>;
type UpdateCompetitorInput = z.infer<typeof updateCompetitorSchema>;

const addUrlSchema = z.object({
  url: z.string().url("Invalid URL"),
});

type AddUrlInput = z.infer<typeof addUrlSchema>;

const diffReportEmailSchema = z
  .object({
    kind: z.literal("diff-report"),
    competitor: z.string().min(1, "Competitor name is required"),
    fromDate: z.string().regex(/^\d{8}$/, "Date must be in DDMMYYYY format"),
    toDate: z.string().regex(/^\d{8}$/, "Date must be in DDMMYYYY format"),
    data: z.object({
      branding: z.object({
        summary: z.string(),
        changes: z.array(z.string()),
        urls: z.record(z.array(z.string())),
      }),
      integration: z.object({
        summary: z.string(),
        changes: z.array(z.string()),
        urls: z.record(z.array(z.string())),
      }),
      pricing: z.object({
        summary: z.string(),
        changes: z.array(z.string()),
        urls: z.record(z.array(z.string())),
      }),
      positioning: z.object({
        summary: z.string(),
        changes: z.array(z.string()),
        urls: z.record(z.array(z.string())),
      }),
      product: z.object({
        summary: z.string(),
        changes: z.array(z.string()),
        urls: z.record(z.array(z.string())),
      }),
      partnership: z.object({
        summary: z.string(),
        changes: z.array(z.string()),
        urls: z.record(z.array(z.string())),
      }),
    }),
  })
  .refine(
    (data) => {
      const from = parseInt(data.fromDate);
      const to = parseInt(data.toDate);
      return from <= to;
    },
    {
      message: "fromDate must be earlier than or equal to toDate",
    }
  );

const waitlistWelcomeEmailSchema = z.object({
  kind: z.literal("waitlist-welcome"),
  userName: z.string().optional(),
  position: z.number().int().positive(),
  estimatedWaitTime: z.string().min(1, "Estimated wait time is required"),
  referralCode: z.string().min(1, "Referral code is required"),
  referralLink: z.string().url("Invalid referral link URL"),
});

const trial0DayEmailSchema = z.object({
  kind: z.literal("trial-0-day"),
  userName: z.string().optional(),
  upgradeLink: z.string().url("Invalid upgrade link URL"),
});

const trial3DayEmailSchema = z.object({
  kind: z.literal("trial-3-day"),
  userName: z.string().optional(),
  upgradeLink: z.string().url("Invalid upgrade link URL"),
});

const trial7DayEmailSchema = z.object({
  kind: z.literal("trial-7-day"),
  userName: z.string().optional(),
  upgradeLink: z.string().url("Invalid upgrade link URL"),
});

const trial14DayEmailSchema = z.object({
  kind: z.literal("trial-14-day"),
  userName: z.string().optional(),
  upgradeLink: z.string().url("Invalid upgrade link URL"),
});

const successfulConversionEmailSchema = z.object({
  kind: z.literal("successful-conversion"),
  userName: z.string().optional(),
});

const failedConversionEmailSchema = z.object({
  kind: z.literal("failed-conversion"),
  userName: z.string().optional(),
  upgradeLink: z.string().url("Invalid upgrade link URL"),
});

const waitlistOffboardingEmailSchema = z.object({
  kind: z.literal("waitlist-offboarding"),
  userName: z.string().optional(),
  inviteLink: z.string().url("Invalid invite link URL"),
});

const waitlistOnboardingEmailSchema = z.object({
  kind: z.literal("waitlist-onboarding"),
  userName: z.string().optional(),
});

const emailTemplateSchema = z.discriminatedUnion("kind", [
  diffReportEmailSchema._def.schema,
  waitlistWelcomeEmailSchema,
  trial0DayEmailSchema,
  trial3DayEmailSchema,
  trial7DayEmailSchema,
  trial14DayEmailSchema,
  successfulConversionEmailSchema,
  failedConversionEmailSchema,
  waitlistOffboardingEmailSchema,
  waitlistOnboardingEmailSchema,
]);

export const notificationSchema = z
  .object({
    templateId: z.enum([
      "diff-report",
      "waitlist-welcome",
      "trial-0-day",
      "trial-3-day",
      "trial-7-day",
      "trial-14-day",
      "successful-conversion",
      "failed-conversion",
      "waitlist-offboarding",
      "waitlist-onboarding",
    ]),
    emailTemplateParams: emailTemplateSchema,
    emails: z
      .array(z.string().email("Invalid email address"))
      .min(1, "At least one email is required")
      .max(100, "Maximum 100 emails per request"),
  })
  .refine((data) => data.templateId === data.emailTemplateParams.kind, {
    message: "templateId must match emailTemplateParams.kind",
  });

const subscriptionSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export {
  getScreenshotSchema,
  getScreenshotParamSchema,
  getScreenshotQuerySchema,
  screenshotSchema,
  diffRequestSchema,
  historyQuerySchema,
  subscriptionSchema,
  reportRequestSchema,
  CreateCompetitorInput,
  UpdateCompetitorInput,
  AddUrlInput,
  addUrlSchema,
};
