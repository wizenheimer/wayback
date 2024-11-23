// src/index.ts

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, ScreenshotOptions } from "./types";
import { DEFAULT_SCREENSHOT_OPTIONS, R2_CONFIG } from "./config";
import {
  getScreenshotParamSchema,
  getScreenshotQuerySchema,
  screenshotSchema,
} from "./schema";
import { initializeServices } from "./utils/initializer";
import { bearerAuth } from "hono/bearer-auth";
import { encodeBase64 } from "./utils/encoding";

const app = new Hono<{ Bindings: Bindings }>();

app.use("/*", async (c, next) => {
  const bearer = bearerAuth({ token: c.env.ARCHIVE_API_TOKEN });
  return bearer(c, next);
});

// Take screenshot endpoint
app.post("/screenshot", zValidator("json", screenshotSchema), async (c) => {
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
});

// Get screenshot endpoint
app.get(
  "/screenshot/:hash/:date",
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
  "/content/:hash/:date",
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

export default app;
