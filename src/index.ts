// src/index.ts

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, ScreenshotOptions } from "./types";
import { DEFAULT_SCREENSHOT_OPTIONS, R2_CONFIG } from "./config";
import {
  diffRequestSchema,
  getScreenshotParamSchema,
  getScreenshotQuerySchema,
  historyQuerySchema,
  screenshotSchema,
} from "./schema";
import { initializeServices } from "./utils/initializer";
import { bearerAuth } from "hono/bearer-auth";
import { encodeBase64 } from "./utils/encoding";
import { generatePathHash } from "./utils/path";
import {
  diffCreationEndpoint,
  diffHistoryEndpoint,
  screenshotContentQueryEndpoint,
  screenshotCreationEndpoint,
  screenshotImageQueryEndpoint,
} from "./constants";

const app = new Hono<{ Bindings: Bindings }>();

app.use("/*", async (c, next) => {
  const bearer = bearerAuth({ token: c.env.ARCHIVE_API_TOKEN });
  return bearer(c, next);
});

// Take screenshot endpoint
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

// Get screenshot endpoint
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

// Get content endpoint
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

// Generate diff endpoint
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

export default app;
