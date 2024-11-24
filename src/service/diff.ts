// src/service/diff.ts
import { AggregatedReport, DiffAnalysis } from "../types";
import { AIService } from "./ai";
import { DBService } from "./db";
import { ScreenshotService } from "./screenshot";

export class DiffService {
  constructor(
    private screenshot: ScreenshotService,
    private diffDB: DBService,
    private ai: AIService
  ) {}

  async createDiff(params: {
    url: string;
    timestamp1: string;
    timestamp2: string;
  }): Promise<{
    differences: DiffAnalysis;
    metadata: {
      url: string;
      timestamp1: string;
      timestamp2: string;
      analyzed_at: string;
    };
  }> {
    const { url, timestamp1, timestamp2 } = params;

    // Ensure table exists
    await this.diffDB.ensureDiffTable();

    // Fetch both content versions
    const [content1Obj, content2Obj] = await Promise.all([
      this.screenshot.getScreenshotContentFromUrl(url, timestamp1),
      this.screenshot.getScreenshotContentFromUrl(url, timestamp2),
    ]);

    if (!content1Obj || !content2Obj) {
      throw new Error("One or both content versions not found");
    }

    // Get text content
    const [content1Text, content2Text] = await Promise.all([
      content1Obj.text(),
      content2Obj.text(),
    ]);

    // Analyze with OpenAI
    const differences = await this.ai.analyzeDifferences(
      content1Text,
      content2Text
    );

    // Store in database
    await this.diffDB.insertDiff({
      url,
      timestamp1,
      timestamp2,
      differences,
    });

    return {
      differences,
      metadata: {
        url,
        timestamp1,
        timestamp2,
        analyzed_at: new Date().toISOString(),
      },
    };
  }

  async getDiffHistory(params: {
    url: string;
    from?: string;
    to?: string;
    limit?: number;
  }) {
    const { url, from, to, limit } = params;

    // Validate date range if both are provided
    if (from && to && from > to) {
      throw new Error("From date must be earlier than or equal to to date");
    }

    // Ensure table exists
    await this.diffDB.ensureDiffTable();

    // Get history with date range
    const results = await this.diffDB.getDiffHistory({
      url,
      from,
      to,
      limit,
    });

    return {
      results,
      metadata: {
        url,
        dateRange: {
          from: from || "beginning",
          to: to || "present",
        },
        count: results.length,
        limit,
      },
    };
  }

  async generateReport(params: {
    urls: string[];
    timestamp1?: string;
    timestamp2?: string;
  }): Promise<AggregatedReport> {
    const { urls, timestamp1, timestamp2 } = params;

    // Initialize the aggregated report structure
    const aggregatedReport: AggregatedReport = {
      branding: { changes: [], urls: {} },
      integration: { changes: [], urls: {} },
      pricing: { changes: [], urls: {} },
      product: { changes: [], urls: {} },
      positioning: { changes: [], urls: {} },
      partnership: { changes: [], urls: {} },
      metadata: {
        generatedAt: new Date().toISOString(),
        timeRange: {
          from: "",
          to: "",
        },
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
      },
    };

    // Process each URL
    const diffPromises = urls.map(async (url: string) => {
      try {
        const diffs = await this.diffDB.getDiffHistory({
          url,
          from: timestamp1,
          to: timestamp2,
          limit: 1,
        });

        if (diffs.length === 0) {
          // No diffs found in time range
          aggregatedReport.metadata.processedUrls.skipped.push(url);
          aggregatedReport.metadata.processingStats.skippedCount++;
          aggregatedReport.metadata.errors[url] =
            "No diffs found in specified time range";
          return;
        }

        const diff = diffs[0];

        // Update time range in metadata
        if (
          !aggregatedReport.metadata.timeRange.from ||
          diff.timestamp1 < aggregatedReport.metadata.timeRange.from
        ) {
          aggregatedReport.metadata.timeRange.from = diff.timestamp1;
        }
        if (
          !aggregatedReport.metadata.timeRange.to ||
          diff.timestamp2 > aggregatedReport.metadata.timeRange.to
        ) {
          aggregatedReport.metadata.timeRange.to = diff.timestamp2;
        }

        // Process each category
        const categories: (keyof DiffAnalysis)[] = [
          "branding",
          "integration",
          "pricing",
          "product",
          "positioning",
          "partnership",
        ];

        categories.forEach((category) => {
          const changes = diff[`${category}_changes`];
          if (changes && changes.length > 0) {
            // Add new unique changes to the global list
            changes.forEach((change: string) => {
              if (!aggregatedReport[category].changes.includes(change)) {
                aggregatedReport[category].changes.push(change);
              }

              // Add changes to URL mapping
              if (!aggregatedReport[category].urls[url]) {
                aggregatedReport[category].urls[url] = [];
              }
              if (!aggregatedReport[category].urls[url].includes(change)) {
                aggregatedReport[category].urls[url].push(change);
              }
            });
          }
        });

        // Mark URL as successfully processed
        aggregatedReport.metadata.processedUrls.successful.push(url);
        aggregatedReport.metadata.processingStats.successCount++;
      } catch (error) {
        // Handle individual URL processing errors
        aggregatedReport.metadata.processedUrls.failed.push(url);
        aggregatedReport.metadata.processingStats.failureCount++;
        aggregatedReport.metadata.errors[url] =
          error instanceof Error ? error.message : "Unknown error occurred";
      }
    });

    // Wait for all diffs to be processed
    await Promise.all(diffPromises);

    // Sort changes in each category for consistency
    Object.keys(aggregatedReport).forEach((category) => {
      if (category !== "metadata") {
        aggregatedReport[
          category as keyof Omit<AggregatedReport, "metadata">
        ].changes.sort();
      }
    });

    // Sort the processed URLs arrays for consistency
    aggregatedReport.metadata.processedUrls.successful.sort();
    aggregatedReport.metadata.processedUrls.failed.sort();
    aggregatedReport.metadata.processedUrls.skipped.sort();

    return aggregatedReport;
  }
}
