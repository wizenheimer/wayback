// src/index.ts

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  AggregatedReport,
  Bindings,
  DiffAnalysis,
  ScreenshotOptions,
} from "./types";
import { DEFAULT_SCREENSHOT_OPTIONS, R2_CONFIG } from "./config";
import {
  diffRequestSchema,
  getScreenshotParamSchema,
  getScreenshotQuerySchema,
  historyQuerySchema,
  reportRequestSchema,
  screenshotSchema,
} from "./schema";
import { initializeServices } from "./utils/initializer";
import { bearerAuth } from "hono/bearer-auth";
import { encodeBase64 } from "./utils/encoding";
import { generatePathHash } from "./utils/path";
import {
  diffCreationEndpoint,
  diffHistoryEndpoint,
  reportCreationEndpoint,
  screenshotContentQueryEndpoint,
  screenshotCreationEndpoint,
  screenshotImageQueryEndpoint,
} from "./constants";
import { swaggerUI } from "@hono/swagger-ui";
import { openApiSpec } from "./openapi";

const app = new Hono<{ Bindings: Bindings }>();

// =======================================================
//                 Swagger Documentation
// =======================================================

// Serve Swagger UI
app.get("/", swaggerUI({ url: "/docs" }));

// Serve OpenAPI specification
app.get("/docs", (c) => {
  return c.json(openApiSpec);
});

// =======================================================
//                 Authentication Middleware
// =======================================================

app.use("/api/*", async (c, next) => {
  const bearer = bearerAuth({ token: c.env.ARCHIVE_API_TOKEN });
  return bearer(c, next);
});

// =======================================================
//               Screenshot Capture Endpoints
// =======================================================

// Trigger a screenshot capture for a given URL
// Store the image and text content in the storage service
app.post(
  screenshotCreationEndpoint,
  zValidator("json", screenshotSchema),
  async (c) => {
    try {
      const userOptions = await c.req.json<ScreenshotOptions>();
      const options = { ...DEFAULT_SCREENSHOT_OPTIONS, ...userOptions };
      const { screenshot } = initializeServices(c);

      const result = await screenshot.takeScreenshot(options);

      return c.json({
        status: "success",
        ...result,
      });
    } catch (error) {
      console.error("Screenshot error:", error);
      return c.json(
        {
          status: "error",
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
        500
      );
    }
  }
);

// Return the image content of a screenshot
// This requires the content to be stored in the storage service
app.get(
  screenshotImageQueryEndpoint,
  zValidator("query", getScreenshotQuerySchema),
  zValidator("param", getScreenshotParamSchema),
  async (c) => {
    try {
      const { hash, date } = c.req.valid("param");
      const { format } = c.req.valid("query");

      const path = `screenshot/${hash}/${date}`;

      const { storage } = initializeServices(c);
      const object = await storage.getScreenshot(path);

      if (!object) {
        return c.json(
          {
            status: "error",
            error: "Screenshot not found",
          },
          404
        );
      }

      const contentType = object.httpMetadata?.contentType || "image/jpeg";
      const arrayBuffer = await object.arrayBuffer();

      switch (format) {
        case "base64": {
          const base64 = encodeBase64(arrayBuffer);
          return c.json({
            status: "success",
            data: `data:${contentType};base64,${base64}`,
            metadata: object.customMetadata,
          });
        }

        case "binary": {
          return new Response(object.body, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": R2_CONFIG.CACHE_CONTROL,
            },
          });
        }

        case "json": {
          const base64 = encodeBase64(arrayBuffer);
          return c.json({
            status: "success",
            data: base64,
            contentType,
            metadata: object.customMetadata,
          });
        }
      }
    } catch (error) {
      return c.json(
        {
          status: "error",
          error: "Failed to retrieve screenshot",
        },
        500
      );
    }
  }
);

// Return the text content of a screenshot
// This requires the content to be stored in the storage service
app.get(
  screenshotContentQueryEndpoint,
  zValidator("param", getScreenshotParamSchema),
  async (c) => {
    try {
      const { hash, date } = c.req.valid("param");

      const path = `content/${hash}/${date}`;

      const { storage } = initializeServices(c);
      const object = await storage.getContent(path);

      if (!object) {
        return c.json(
          {
            status: "error",
            error: "Content not found",
          },
          404
        );
      }

      const content = await object.text();

      return c.json({
        status: "success",
        data: content,
        metadata: object.customMetadata,
      });
    } catch (error) {
      return c.json(
        {
          status: "error",
          error: "Failed to retrieve content",
        },
        500
      );
    }
  }
);

// =======================================================
//              Diff Analysis Endpoints
// =======================================================

// Generate a diff for a given url between any two content versions
// This requires the content to be stored in the storage service
app.post(
  diffCreationEndpoint,
  zValidator("json", diffRequestSchema),
  async (c) => {
    try {
      const { url, timestamp1, timestamp2 } = await c.req.json();
      console.log("Diff request:", { url, timestamp1, timestamp2 });

      const { storage, db, ai } = initializeServices(c);
      console.log("Services initialized");

      // Ensure table exists
      await db.ensureDiffTable();

      const urlHash = generatePathHash(url);

      // Fetch both content versions
      const [content1Obj, content2Obj] = await Promise.all([
        storage.getContent(`content/${urlHash}/${timestamp1}`),
        storage.getContent(`content/${urlHash}/${timestamp2}`),
      ]);

      if (!content1Obj || !content2Obj) {
        return c.json(
          {
            status: "error",
            error: "One or both content versions not found",
          },
          404
        );
      }

      // Get text content
      const [content1Text, content2Text] = await Promise.all([
        content1Obj.text(),
        content2Obj.text(),
      ]);
      console.log("Content fetched for diff analysis");

      // Analyze with OpenAI
      const differences = await ai.analyzeDifferences(
        content1Text,
        content2Text
      );
      console.log("Diff analysis completed");

      // Store in database
      await db.insertDiff({
        url,
        timestamp1,
        timestamp2,
        differences,
      });
      console.log("Diff stored in database");

      return c.json({
        status: "success",
        data: {
          differences,
          metadata: {
            url,
            timestamp1,
            timestamp2,
            analyzed_at: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error("Diff analysis error:", error);
      return c.json(
        {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        },
        500
      );
    }
  }
);

// Query diff for a given URL between any two content versions
// This requires the content to be stored in the storage service
app.get(
  diffHistoryEndpoint,
  zValidator("query", historyQuerySchema),
  async (c) => {
    try {
      const { url, from, to, limit } = c.req.valid("query");
      const { db } = initializeServices(c);

      // Validate date range if both are provided
      if (from && to && from > to) {
        return c.json(
          {
            status: "error",
            error: "From date must be earlier than or equal to to date",
          },
          400
        );
      }

      // Ensure table exists
      await db.ensureDiffTable();

      // Get history with date range
      const results = await db.getDiffHistory({
        url,
        from,
        to,
        limit,
      });

      return c.json({
        status: "success",
        data: {
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
        },
      });
    } catch (error) {
      console.error("Error fetching diff history:", error);
      return c.json(
        {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch diff history",
        },
        500
      );
    }
  }
);

// Query and aggregate diffs for a list of URLs within a time range
// This requires the content to be stored in the storage service
app.post(
  reportCreationEndpoint,
  zValidator("json", reportRequestSchema),
  async (c) => {
    try {
      const { urls, timestamp1, timestamp2 } = await c.req.json();
      const { db } = initializeServices(c);

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
            skipped: [], // For URLs with no diffs in time range
          },
          processingStats: {
            totalUrls: urls.length,
            successCount: 0,
            failureCount: 0,
            skippedCount: 0,
          },
          errors: {} as Record<string, string>, // URL -> error message mapping
        },
      };

      // Process each URL
      const diffPromises = urls.map(async (url: string) => {
        try {
          const diffs = await db.getDiffHistory({
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

      return c.json({
        status: "success",
        data: aggregatedReport,
      });
    } catch (error) {
      console.error("Report generation error:", error);
      return c.json(
        {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate report",
        },
        500
      );
    }
  }
);

// =======================================================
//                  Competitor CRUD Endpoints
// =======================================================

export default app;
