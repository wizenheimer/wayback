// src/index.ts

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  Bindings,
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
      const { screenshotService } = initializeServices(c);

      const result = await screenshotService.takeScreenshot(options);

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

      const { screenshotService } = initializeServices(c);
      const object = await screenshotService.getScreenshotImage(hash, date);

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

      const { screenshotService } = initializeServices(c);
      const object = await screenshotService.getScreenshotContent(hash, date);

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

      const { diffService } = initializeServices(c);

      const result = await diffService.createDiff({
        url,
        timestamp1,
        timestamp2,
      });

      return c.json({
        status: "success",
        data: result,
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
      const { diffService } = initializeServices(c);

      const result = await diffService.getDiffHistory({
        url,
        from,
        to,
        limit,
      });

      return c.json({
        status: "success",
        data: result,
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
      const { diffService } = initializeServices(c);

      const aggregatedReport = await diffService.generateReport({
        urls,
        timestamp1,
        timestamp2,
      });

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
      const { competitorService } = initializeServices(c);

      const result = await competitorService.createCompetitor(input);

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
    const { competitorService } = initializeServices(c);
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");

    const result = await competitorService.listCompetitors({ limit, offset });

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
    const { competitorService } = initializeServices(c);
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");
    const domainHash = c.req.query("domain_hash");

    const result = await competitorService.listCompetitorUrls({
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
    const { competitorService } = initializeServices(c);

    const result = await competitorService.findCompetitorsByUrlHash(domainHash);

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
    const { competitorService } = initializeServices(c);

    const result = await competitorService.getCompetitor(id);

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
      const { competitorService } = initializeServices(c);

      // Add URL
      const newUrl = await competitorService.addUrl(competitorId, url);

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

    const { competitorService } = initializeServices(c);

    // Remove URL
    await competitorService.removeUrl(competitorId, url);

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
      const { competitorService } = initializeServices(c);

      const result = await competitorService.updateCompetitor(id, input);

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
    const { competitorService } = initializeServices(c);

    await competitorService.deleteCompetitor(id);

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
