// src/types/diff.ts

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
