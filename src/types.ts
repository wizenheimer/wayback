// src/types.ts

export type ClipOptions = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type WaitUntilOption =
  | "load"
  | "domcontentloaded"
  | "networkidle0"
  | "networkidle2";

export type waitForSelectorAlgorithm = "at_least_one" | "at_least_by_count";

// Resource types that can be blocked
export const BlockableResources = {
  DOCUMENT: "document",
  STYLESHEET: "stylesheet",
  IMAGE: "image",
  MEDIA: "media",
  FONT: "font",
  SCRIPT: "script",
  TEXTTRACK: "texttrack",
  XHR: "xhr",
  FETCH: "fetch",
  EVENTSOURCE: "eventsource",
  WEBSOCKET: "websocket",
  MANIFEST: "manifest",
  OTHER: "other",
} as const;

export type BlockResourceType =
  (typeof BlockableResources)[keyof typeof BlockableResources];

// Timezones
export const Timezones = {
  AMERICA_BELIZE: "America/Belize",
  AMERICA_CAYMAN: "America/Cayman",
  AMERICA_CHICAGO: "America/Chicago",
  AMERICA_COSTA_RICA: "America/Costa_Rica",
  AMERICA_DENVER: "America/Denver",
  AMERICA_EDMONTON: "America/Edmonton",
  AMERICA_EL_SALVADOR: "America/El_Salvador",
  AMERICA_GUATEMALA: "America/Guatemala",
  AMERICA_GUAYAQUIL: "America/Guayaquil",
  AMERICA_HERMOSILLO: "America/Hermosillo",
  AMERICA_JAMAICA: "America/Jamaica",
  AMERICA_LOS_ANGELES: "America/Los_Angeles",
  AMERICA_MEXICO_CITY: "America/Mexico_City",
  AMERICA_NASSAU: "America/Nassau",
  AMERICA_NEW_YORK: "America/New_York",
  AMERICA_PANAMA: "America/Panama",
  AMERICA_PORT_AU_PRINCE: "America/Port-au-Prince",
  AMERICA_SANTIAGO: "America/Santiago",
  AMERICA_TEGUCIGALPA: "America/Tegucigalpa",
  AMERICA_TIJUANA: "America/Tijuana",
  AMERICA_TORONTO: "America/Toronto",
  AMERICA_VANCOUVER: "America/Vancouver",
  AMERICA_WINNIPEG: "America/Winnipeg",
  ASIA_KUALA_LUMPUR: "Asia/Kuala_Lumpur",
  ASIA_SHANGHAI: "Asia/Shanghai",
  ASIA_TASHKENT: "Asia/Tashkent",
  EUROPE_BERLIN: "Europe/Berlin",
  EUROPE_KIEV: "Europe/Kiev",
  EUROPE_LISBON: "Europe/Lisbon",
  EUROPE_LONDON: "Europe/London",
  EUROPE_MADRID: "Europe/Madrid",
  PACIFIC_AUCKLAND: "Pacific/Auckland",
  PACIFIC_MAJURO: "Pacific/Majuro",
} as const;

export type Timezone = (typeof Timezones)[keyof typeof Timezones];

// IP Countries
export const IpCountries = {
  US: "us",
  GB: "gb",
  DE: "de",
  IT: "it",
  FR: "fr",
  CN: "cn",
  CA: "ca",
  ES: "es",
  JP: "jp",
  KR: "kr",
  IN: "in",
  AU: "au",
  BR: "br",
  MX: "mx",
  NZ: "nz",
  PE: "pe",
  IS: "is",
  IE: "ie",
} as const;

export type IpCountry = (typeof IpCountries)[keyof typeof IpCountries];

export type fullPageAlgorithm =
  // scroll, screenshot and merge the screenshots
  | "by_sections"
  // adjust viewport height to the height of the page
  | "default";

export type ScreenshotOptions = {
  // Target Options
  // The URL of the website to take a screenshot of.
  url: string;

  // Run ID for the screenshot
  runId: string;

  // Selector Options
  // A selector to take screenshot of.
  selector?: string;
  // Selector to scroll into view.
  scrollIntoView?: string;
  // Once reached the selector, scroll by this amount of pixels.
  adjustTop?: number;
  // TO handle case where the page or the part of the element might not be visible on the viewport.
  captureBeyondViewport?: boolean;

  // Capture Options
  // Whether to capture the full page.
  fullPage?: boolean;
  // Whether to scroll the page before capturing the full page. Triggers rendering of all lazy loaded images.
  fullPageScroll?: boolean;
  // Algorithm to use to capture the full page.
  fullPageAlgorithm?: fullPageAlgorithm;
  // Milliseconds to wait between scrolls.
  scrollDelay?: number;
  // Scroll by how many pixels.
  scrollBy?: number;
  // Maximum height of the screenshot.
  maxHeight?: number;
  // Format of the image.
  format?: "jpg" | "png" | "webp";
  // Image quality from 0 to 100.
  imageQuality?: number;
  // Whether to omit the background.
  omitBackground?: boolean;

  // Clip Options
  clip?: ClipOptions;

  // Disallow certain resources
  // Whether to block ads.
  blockAds?: boolean;
  // Whether to block cookie banners.
  blockCookieBanners?: boolean;
  // Whether to block banners by heuristics.
  blockBannersByHeuristics?: boolean;
  // Whether to block trackers.
  blockTrackers?: boolean;
  // Whether to block chats.
  blockChats?: boolean;
  // Block requests that match a pattern. Block requests by specifying URL, domain, or even a simple pattern like *example.com*. Each line is processed as a separate pattern.
  blockRequests?: string[];
  // Select resources to block. TODO: make it a multiple select
  blockResources?: BlockResourceType[];

  // Media options
  // Whether to render the page in dark mode.
  darkMode?: boolean;
  // Whether to reduce motion.
  reducedMotion?: boolean;

  // Request Options
  // Specify the user-agent header if you want to override the default one.
  userAgent?: string;
  // Value for the "Authorization" header if needed.
  authorization?: string;
  // One header per line.
  headers?: Record<string, string>;
  // Specify values for "Cookie" headers. One header value per line. A domain is required.
  cookies?: string[];
  // What timezone should the be browser set when rendering a screenshot
  timezone?: Timezone;
  bypassCSP?: boolean;
  // Which country should the IP address be from
  ipCountryCode?: IpCountry;

  // Wait and delay options
  // Time in milliseconds to wait before taking the screenshot.
  delay?: number;
  // Time in milliseconds to wait before taking the screenshot.
  timeout?: number;
  // Time in milliseconds to wait for the page to load.
  navigationTimeout?: number;
  // Wait until the page is fully loaded.
  waitForSelector?: string;
  // Wait until at least one selector is found.
  waitForSelectorAlgorithm?: waitForSelectorAlgorithm;
  // Wait until an event occurred before rendering a screenshot.
  waitUntil?: WaitUntilOption[];

  // Interaction Options
  // A selector of element to click.
  click?: string;
  // Fail if the element to click is not found.
  failIfClickNotFound?: boolean;
  // Hide any elements matching these selectors. One selector per line.
  hideSelectors?: string[];
  // Any custom CSS styles.
  styles?: string;
  // Scripts will be executed in the browser context of the website.
  scripts?: string;
  // If scripts triggers redirect, you can wait until the redirect is complete.
  scriptWaitUntil?: WaitUntilOption[];

  // Metadata options
  // Return image size in metadata.
  metadataImageSize?: boolean;
  // Return page title in metadata.
  metadataPageTitle?: boolean;
  // Return html content in metadata.
  metadataContent?: boolean;
  // Return HTTP status code in metadata.
  metadataHttpStatusCode?: boolean;
  // Return HTTP headers in metadata.
  metadataHttpHeaders?: boolean;
};

export type OutputFormat = "base64" | "binary" | "json";

export type ScreenshotResponse = {
  status: "success" | "error";
  paths?: {
    screenshot: string;
    content: string;
  };
  metadata?: {
    imageWidth: number;
    imageHeight: number;
    pageTitle?: string;
  };
  size?: number;
  url?: string;
  contentType?: string;
  error?: string;
  details?: string;
};

export type ScreenshotMetadata = {
  // The URL of the website to take a screenshot of.
  sourceUrl: string;
  // Date when the screenshot was fetched.
  fetchedAt: string;
  // Which screenshot service was used.
  screenshotService: string;
  // Which options were used to take the screenshot.
  options: string;
  // Whats the image width and height.
  imageWidth: number;
  imageHeight: number;
  // What's the total text content length.
  contentLength: number;
  // What's the page title.
  pageTitle?: string;
  // Whats the content type of the screenshot.
  contentType?: string;
};

export type Bindings = {
  // Key bindings
  SCREENSHOT_SERVICE_API_KEY: string;
  SCREENSHOT_SERVICE_ORIGIN: string;
  WAYBACK_API_TOKEN: string;
  OPENAI_API_KEY: string;

  // R2Bucket bindings
  archive: R2Bucket;

  // Database bindings
  DIFF_DB: D1Database;
  COMPETITOR_DB: D1Database;

  // Notification Service bindings
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
};

export interface DiffAnalysis {
  branding: string[];
  integration: string[];
  pricing: string[];
  product: string[];
  positioning: string[];
  partnership: string[];
}

export interface CategoryBase {
  changes: string[];
  urls: Record<string, string[]>;
}

export interface CategoryEnriched extends CategoryBase {
  summary: string;
}

export interface DiffData {
  branding: CategoryBase | CategoryEnriched;
  integration: CategoryBase | CategoryEnriched;
  pricing: CategoryBase | CategoryEnriched;
  positioning: CategoryBase | CategoryEnriched;
  product: CategoryBase | CategoryEnriched;
  partnership: CategoryBase | CategoryEnriched;
}

export interface ReportRequest {
  urls: string[];
  runId1?: string;
  runId2?: string;
  weekNumber?: string;
  competitor: string; // Added to match email template
  enriched?: boolean;
}

export interface DiffRequest {
  url: string;
  runId1: string;
  runId2: string;
  weekNumber1?: string; // Optional, will use current week if not provided
  weekNumber2?: string; // Optional, will use current week if not provided
}

export interface DiffHistoryQuery {
  url: string;
  fromRunId?: string;
  toRunId?: string;
  weekNumber?: string; // Optional, to filter by specific week
  limit?: number;
}

export interface DiffReport {
  url: string;
  timestamp1: string;
  timestamp2: string;
  differences: DiffAnalysis;
  metadata?: {
    pageTitle?: string;
    lastUpdated?: string;
  };
}

export interface AggregatedReport {
  data: DiffData;
  metadata: {
    generatedAt: string;
    weekNumber: string;
    runRange: {
      fromRun: string;
      toRun: string;
    };
    competitor: string;
    urlCount: number;
    processedUrls: {
      successful: string[];
      failed: string[];
      skipped: string[];
    };
    processingStats: {
      totalUrls: number;
      successCount: number;
      failureCount: number;
      skippedCount: number;
    };
    errors: Record<string, string>;
    enriched: boolean;
  };
}

export interface Competitor {
  id: number; // auto-generated
  domain: string; // extracted domain
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CompetitorUrl {
  id: number;
  competitor_id: number;
  url: string;
  domain_hash: string; // moved here from Competitor
  created_at: string;
}

export interface CompetitorWithUrls extends Competitor {
  urls: string[];
}

export interface BaseEmailTemplateParameters {
  kind: string;
}

export interface DiffReportEmailParameters extends BaseEmailTemplateParameters {
  kind: "diff-report";
  competitor: string;
  fromDate: string;
  toDate: string;
  data: {
    branding: {
      summary: string;
      changes: string[];
      urls: Record<string, string[]>;
    };
    integration: {
      summary: string;
      changes: string[];
      urls: Record<string, string[]>;
    };
    pricing: {
      summary: string;
      changes: string[];
      urls: Record<string, string[]>;
    };
    positioning: {
      summary: string;
      changes: string[];
      urls: Record<string, string[]>;
    };
    product: {
      summary: string;
      changes: string[];
      urls: Record<string, string[]>;
    };
    partnership: {
      summary: string;
      changes: string[];
      urls: Record<string, string[]>;
    };
  };
}

export interface Trial0DayEmailParameters extends BaseEmailTemplateParameters {
  kind: "trial-0-day";
  userName?: string;
  upgradeLink: string;
}

export interface Trial3DayEmailParameters extends BaseEmailTemplateParameters {
  kind: "trial-3-day";
  userName?: string;
  upgradeLink: string;
}

export interface Trial7DayEmailParameters extends BaseEmailTemplateParameters {
  kind: "trial-7-day";
  userName?: string;
  upgradeLink: string;
}

export interface Trial14DayEmailParameters extends BaseEmailTemplateParameters {
  kind: "trial-14-day";
  userName?: string;
  upgradeLink: string;
}

export interface SuccessfulConversionEmailParameters
  extends BaseEmailTemplateParameters {
  kind: "successful-conversion";
  userName?: string;
}

export interface FailedConversionEmailParameters
  extends BaseEmailTemplateParameters {
  kind: "failed-conversion";
  userName?: string;
  upgradeLink: string;
}

export interface WaitlistOffboardingEmailParameters
  extends BaseEmailTemplateParameters {
  kind: "waitlist-offboarding";
  userName?: string;
  inviteLink: string;
}

export interface WaitlistOnboardingEmailParameters
  extends BaseEmailTemplateParameters {
  kind: "waitlist-onboarding";
  userName?: string;
}

export type EmailTemplateParameters =
  | DiffReportEmailParameters
  | Trial0DayEmailParameters
  | Trial3DayEmailParameters
  | Trial7DayEmailParameters
  | Trial14DayEmailParameters
  | SuccessfulConversionEmailParameters
  | FailedConversionEmailParameters
  | WaitlistOffboardingEmailParameters
  | WaitlistOnboardingEmailParameters;

export interface EmailTemplateMap {
  "diff-report": DiffReportEmailParameters;
  "trial-0-day": Trial0DayEmailParameters;
  "trial-3-day": Trial3DayEmailParameters;
  "trial-7-day": Trial7DayEmailParameters;
  "trial-14-day": Trial14DayEmailParameters;
  "successful-conversion": SuccessfulConversionEmailParameters;
  "failed-conversion": FailedConversionEmailParameters;
  "waitlist-offboarding": WaitlistOffboardingEmailParameters;
  "waitlist-onboarding": WaitlistOnboardingEmailParameters;
}

export type EmailTemplateId = keyof EmailTemplateMap;

export interface NotificationRequest<T extends EmailTemplateId> {
  templateId: T;
  emailTemplateParams: EmailTemplateMap[T];
  emails: string[];
}

export interface NotificationResults {
  email: {
    successful: string[];
    failed: string[];
  };
}

export interface NotificationServiceConfig {
  resend: {
    apiKey: string;
    fromEmail: string;
    replyTo?: string;
  };
}

export interface Subscription {
  id: number;
  competitor_id: number;
  email: string;
  created_at: string;
  status: "active" | "unsubscribed";
}
