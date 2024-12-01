// src/types/core.ts

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

  // Workflow Bindings
  SCREENSHOT_DIFF_WORKFLOW: Workflow;
  COMPETITOR_REPORT_WORKFLOW: Workflow;

  // Queue Bindings
  diff_queue: Queue<QueueMessage>;
  report_queue: Queue<QueueMessage>;
};

export interface QueueMessage {
  url?: string;
  runId?: number;
  competitorId?: number;
  runId1?: number;
  runId2?: number;
  weekNumber?: string;
}
