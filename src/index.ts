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
  AddUrlInput,
  addUrlSchema,
  competitorSchema,
  diffRequestSchema,
  getScreenshotParamSchema,
  getScreenshotQuerySchema,
  historyQuerySchema,
  reportRequestSchema,
  screenshotSchema,
  updateCompetitorSchema,
} from "./schema";
import { initializeServices } from "./utils/initializer";
import { bearerAuth } from "hono/bearer-auth";
import { encodeBase64 } from "./utils/encoding";
import { generatePathHash } from "./utils/path";
import {
  baseStub,
  createCompetitorEndpoint,
  deleteCompetitorEndpoint,
  diffCreationEndpoint,
  diffHistoryEndpoint,
  docsStub,
  getCompetitorEndpoint,
  listCompetitorsbyHash,
  listCompetitorsEndpoint,
  listCompetitorsURLs,
  reportCreationEndpoint,
  screenshotContentQueryEndpoint,
  screenshotCreationEndpoint,
  screenshotImageQueryEndpoint,
  updateCompetitorEndpoint,
  updateCompetitorURLEndpoint,
} from "./constants";
import { swaggerUI } from "@hono/swagger-ui";
import { openApiSpec } from "./openapi";

const app = new Hono<{ Bindings: Bindings }>();

// =======================================================
//                 Swagger Documentation
// =======================================================

// Serve Swagger UI
app.get("/", swaggerUI({ url: docsStub }));

// Serve OpenAPI specification
app.get(docsStub, (c) => {
  return c.json(openApiSpec);
});

// =======================================================
//                 Authentication Middleware
// =======================================================

app.use(`${baseStub}/*`, async (c, next) => {
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

      const { screenshot } = initializeServices(c);
      const object = await screenshot.getScreenshotImage(hash, date);

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

      const { screenshot } = initializeServices(c);
      const object = await screenshot.getScreenshotContent(hash, date);

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

      const { screenshot, diffDB, ai } = initializeServices(c);

      // Ensure table exists
      await diffDB.ensureDiffTable();

      // Fetch both content versions
      const [content1Obj, content2Obj] = await Promise.all([
        screenshot.getScreenshotContentFromUrl(url, timestamp1),
        screenshot.getScreenshotContentFromUrl(url, timestamp2),
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

      // Analyze with OpenAI
      const differences = await ai.analyzeDifferences(
        content1Text,
        content2Text
      );

      // Store in database
      await diffDB.insertDiff({
        url,
        timestamp1,
        timestamp2,
        differences,
      });

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
      const { diffDB } = initializeServices(c);

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
      await diffDB.ensureDiffTable();

      // Get history with date range
      const results = await diffDB.getDiffHistory({
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
      const { diffDB } = initializeServices(c);

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
          const diffs = await diffDB.getDiffHistory({
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

// ===============================================================
//                  Competitor Management - Aggregate
//
//                            Creation and Listing
// ===============================================================

// Create a new competitor
app.post(
  createCompetitorEndpoint,
  zValidator("json", competitorSchema),
  async (c) => {
    try {
      const input = await c.req.json();
      const { competitor } = initializeServices(c);

      const result = await competitor.createCompetitor(input);

      return c.json({
        status: "success",
        data: result,
      });
    } catch (error) {
      console.error("Create competitor error:", error);
      return c.json(
        {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to create competitor",
        },
        500
      );
    }
  }
);

// List all competitors with pagination
app.get(listCompetitorsEndpoint, async (c) => {
  try {
    const { competitor } = initializeServices(c);
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");

    const result = await competitor.listCompetitors({ limit, offset });

    return c.json({
      status: "success",
      data: result.competitors,
      metadata: {
        total: result.total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("List competitors error:", error);
    return c.json(
      {
        status: "error",
        error:
          error instanceof Error ? error.message : "Failed to list competitors",
      },
      500
    );
  }
});

// List competitor URLs with pagination and optional domain hash filter
app.get(listCompetitorsURLs, async (c) => {
  try {
    const { competitor } = initializeServices(c);
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");
    const domainHash = c.req.query("domain_hash");

    const result = await competitor.listCompetitorUrls({
      limit,
      offset,
      domainHash,
    });

    return c.json({
      status: "success",
      data: result.urls,
      metadata: {
        total: result.total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("List competitor URLs error:", error);
    return c.json(
      {
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Failed to list competitor URLs",
      },
      500
    );
  }
});

// Find competitors by URL domain hash
app.get(listCompetitorsbyHash, async (c) => {
  try {
    const domainHash = c.req.param("hash");
    const { competitor } = initializeServices(c);

    const result = await competitor.findCompetitorsByUrlHash(domainHash);

    return c.json({
      status: "success",
      data: result,
      metadata: {
        count: result.length,
      },
    });
  } catch (error) {
    console.error("Find competitors by domain hash error:", error);
    return c.json(
      {
        status: "error",
        error:
          error instanceof Error ? error.message : "Failed to find competitors",
      },
      500
    );
  }
});

// =======================================================================
//                  Competitor Management - Individual
//
//         Get Any, Update Any, Add URL, Remove URL, Delete Competitor
// =======================================================================

// Find competitor by ID
app.get(getCompetitorEndpoint, async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const { competitor } = initializeServices(c);

    const result = await competitor.getCompetitor(id);

    if (!result) {
      return c.json(
        {
          status: "error",
          error: "Competitor not found",
        },
        404
      );
    }

    return c.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("Get competitor error:", error);
    return c.json(
      {
        status: "error",
        error:
          error instanceof Error ? error.message : "Failed to get competitor",
      },
      500
    );
  }
});

// Register a new URL for a competitor
app.post(
  updateCompetitorURLEndpoint,
  zValidator("json", addUrlSchema),
  async (c) => {
    try {
      const competitorId = parseInt(c.req.param("id"));
      const { url } = await c.req.json<AddUrlInput>();
      const { competitor } = initializeServices(c);

      // Add URL
      const newUrl = await competitor.addUrl(competitorId, url);

      return c.json({
        status: "success",
        data: {
          newUrl,
        },
      });
    } catch (error) {
      console.error("Add URL error:", error);

      if (error instanceof Error) {
        if (error.message === "URL already exists for this competitor") {
          return c.json(
            {
              status: "error",
              error: error.message,
            },
            409
          ); // Conflict
        }
        if (error.message === "Competitor not found") {
          return c.json(
            {
              status: "error",
              error: error.message,
            },
            404
          );
        }
      }

      return c.json(
        {
          status: "error",
          error: error instanceof Error ? error.message : "Failed to add URL",
        },
        500
      );
    }
  }
);

// Remove a URL from a competitor
app.delete(updateCompetitorURLEndpoint, async (c) => {
  try {
    const competitorId = parseInt(c.req.param("id"));
    const url = c.req.query("url");

    if (!url) {
      return c.json(
        {
          status: "error",
          error: "URL parameter is required",
        },
        400
      );
    }

    const { competitor } = initializeServices(c);

    // Remove URL
    await competitor.removeUrl(competitorId, url);

    return c.json({
      status: "success",
      data: {
        removedUrl: url,
      },
    });
  } catch (error) {
    console.error("Remove URL error:", error);

    if (error instanceof Error) {
      if (error.message === "URL not found for this competitor") {
        return c.json(
          {
            status: "error",
            error: error.message,
          },
          404
        );
      }
      if (error.message === "Competitor not found") {
        return c.json(
          {
            status: "error",
            error: error.message,
          },
          404
        );
      }
    }

    return c.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Failed to remove URL",
      },
      500
    );
  }
});

// Update any property of a competitor
app.put(
  updateCompetitorEndpoint,
  zValidator("json", updateCompetitorSchema),
  async (c) => {
    try {
      const id = parseInt(c.req.param("id"));
      const input = await c.req.json();
      const { competitor } = initializeServices(c);

      const result = await competitor.updateCompetitor(id, input);

      return c.json({
        status: "success",
        data: result,
      });
    } catch (error) {
      console.error("Update competitor error:", error);
      return c.json(
        {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to update competitor",
        },
        500
      );
    }
  }
);

// Delete entire competitor info including URLs
app.delete(deleteCompetitorEndpoint, async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const { competitor } = initializeServices(c);

    await competitor.deleteCompetitor(id);

    return c.json({
      status: "success",
      message: "Competitor deleted successfully",
    });
  } catch (error) {
    console.error("Delete competitor error:", error);
    return c.json(
      {
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete competitor",
      },
      500
    );
  }
});

export default app;
