// src/service/diff.ts
import {
  AggregatedReport,
  DiffAnalysis,
  DiffHistoryQuery,
  DiffRequest,
  ReportRequest,
} from "../types/diff";
import { getWeekNumber } from "../utils/path";
import { AIService } from "./ai";
import { DBService } from "./db";
import { ScreenshotService } from "./screenshot";

export class DiffService {
  constructor(
    private screenshot: ScreenshotService,
    private diffDB: DBService,
    private ai: AIService
  ) {}

  async createDiff(params: DiffRequest): Promise<{
    differences: DiffAnalysis;
    metadata: {
      url: string;
      runId1: string;
      runId2: string;
      weekNumber1: string;
      weekNumber2: string;
      analyzed_at: string;
    };
  }> {
    const {
      url,
      runId1,
      runId2,
      weekNumber1 = getWeekNumber(),
      weekNumber2 = getWeekNumber(),
    } = params;

    // Ensure table exists
    await this.diffDB.ensureDiffTable();

    // Fetch both content versions
    const [content1Obj, content2Obj] = await Promise.all([
      this.screenshot.getScreenshotContentFromUrl(url, weekNumber1, runId1),
      this.screenshot.getScreenshotContentFromUrl(url, weekNumber2, runId2),
    ]);

    if (!content1Obj || !content2Obj) {
      if (!content1Obj && !content2Obj) {
        throw new Error("No content versions found");
      } else if (!content2Obj) {
        throw new Error("Second content version not found");
      } else if (!content1Obj) {
        throw new Error("First content version not found");
      }
    }

    // Get text content and analyze differences
    const [content1Text, content2Text] = await Promise.all([
      content1Obj.text(),
      content2Obj.text(),
    ]);

    const differences = await this.ai.analyzeDifferences(
      content1Text,
      content2Text
    );

    // Store in database with week number
    await this.diffDB.insertDiff({
      url,
      runId1,
      runId2,
      weekNumber: weekNumber2, // Store using the most recent week number
      differences,
    });

    return {
      differences,
      metadata: {
        url,
        runId1,
        runId2,
        weekNumber1,
        weekNumber2,
        analyzed_at: new Date().toISOString(),
      },
    };
  }

  async getDiffHistory(params: DiffHistoryQuery) {
    const { url, fromRunId, toRunId, weekNumber, limit } = params;

    // Validate run IDs if both are provided
    if (fromRunId && toRunId && fromRunId > toRunId) {
      throw new Error("fromRunId must be earlier than or equal to toRunId");
    }

    // Ensure table exists
    await this.diffDB.ensureDiffTable();

    // Get history with new parameters
    const results = await this.diffDB.getDiffHistory({
      url,
      fromRunId,
      toRunId,
      weekNumber,
      limit,
    });

    return {
      results,
      metadata: {
        url,
        weekNumber: weekNumber,
        dateRange: {
          fromRun: fromRunId || 0,
          toRun: toRunId || 7,
        },
        count: results.length,
        limit,
      },
    };
  }

  async generateReport(params: ReportRequest): Promise<AggregatedReport> {
    const {
      urls,
      runId1,
      runId2,
      weekNumber = getWeekNumber(),
      competitor,
      enriched = false,
    } = params;

    // Initialize base report structure
    const aggregatedReport: AggregatedReport = {
      data: {
        branding: { changes: [], urls: {} },
        integration: { changes: [], urls: {} },
        pricing: { changes: [], urls: {} },
        product: { changes: [], urls: {} },
        positioning: { changes: [], urls: {} },
        partnership: { changes: [], urls: {} },
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        weekNumber,
        runRange: {
          fromRun: runId1 || "",
          toRun: runId2 || "",
        },
        competitor,
        urlCount: urls.length,
        processedUrls: {
          successful: [],
          failed: [],
          skipped: [],
        },
        processingStats: {
          totalUrls: urls.length,
          successCount: 0,
          failureCount: 0,
          skippedCount: 0,
        },
        errors: {},
        enriched: false,
      },
    };

    // Process URLs and collect changes
    const diffPromises = urls.map(async (url: string) => {
      try {
        const diffs = await this.diffDB.getDiffHistory({
          url,
          fromRunId: runId1,
          toRunId: runId2,
          weekNumber,
          limit: 1,
        });

        if (diffs.length === 0) {
          aggregatedReport.metadata.processedUrls.skipped.push(url);
          aggregatedReport.metadata.processingStats.skippedCount++;
          return;
        }

        const diff = diffs[0];
        const categories = [
          "branding",
          "integration",
          "pricing",
          "product",
          "positioning",
          "partnership",
        ] as const;

        categories.forEach((category) => {
          const changes = diff[`${category}_changes`];
          if (changes && changes.length > 0) {
            aggregatedReport.data[category].changes.push(...changes);
            if (!aggregatedReport.data[category].urls[url]) {
              aggregatedReport.data[category].urls[url] = [];
            }
            aggregatedReport.data[category].urls[url].push(...changes);
          }
        });

        aggregatedReport.metadata.processedUrls.successful.push(url);
        aggregatedReport.metadata.processingStats.successCount++;
      } catch (error) {
        aggregatedReport.metadata.processedUrls.failed.push(url);
        aggregatedReport.metadata.processingStats.failureCount++;
        aggregatedReport.metadata.errors[url] =
          error instanceof Error ? error.message : "Unknown error";
      }
    });

    await Promise.all(diffPromises);

    // Enrich with AI summaries if requested
    if (enriched) {
      try {
        await this.ai.enrichReport(aggregatedReport);
        aggregatedReport.metadata.enriched = true;
      } catch (error) {
        aggregatedReport.metadata.errors["enrichment"] =
          error instanceof Error ? error.message : "Failed to enrich report";
      }
    }

    return aggregatedReport;
  }
}
