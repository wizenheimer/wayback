// src/routes/screenshot.ts

import { Hono } from "hono";
import { Bindings } from "../types/core";
import {
  screenshotContentQueryEndpoint,
  screenshotCreationEndpoint,
  screenshotImageQueryEndpoint,
} from "../constants";
import { zValidator } from "@hono/zod-validator";
import {
  getScreenshotParamSchema,
  getScreenshotQuerySchema,
  screenshotSchema,
} from "../schema";
import { ScreenshotOptions } from "../types/screenshot";
import { DEFAULT_SCREENSHOT_OPTIONS, R2_CONFIG } from "../config";
import { initializeServices } from "../utils/initializer";
import { encodeBase64 } from "../utils/encoding";

// =======================================================
//               Screenshot Service Router
// =======================================================
const screenshotServiceRouter = new Hono<{ Bindings: Bindings }>();

// Trigger a screenshot capture for a given URL
// Store the image and text content in the storage service
// Trigger a screenshot capture for a given URL
screenshotServiceRouter.post(
  screenshotCreationEndpoint,
  zValidator("json", screenshotSchema),
  async (c) => {
    try {
      const userOptions = await c.req.json<ScreenshotOptions>();
      const { runId } = userOptions;

      if (!runId) {
        return c.json(
          {
            status: "error",
            error: "runId is required",
          },
          400
        );
      }

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
// Return the image content of a screenshot
screenshotServiceRouter.get(
  screenshotImageQueryEndpoint,
  zValidator("query", getScreenshotQuerySchema),
  zValidator("param", getScreenshotParamSchema),
  async (c) => {
    try {
      const { hash, weekNumber, runId } = c.req.valid("param");
      const { format } = c.req.valid("query");

      const { screenshotService } = initializeServices(c);
      const object = await screenshotService.getScreenshotImage(
        hash,
        weekNumber,
        runId
      );

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
// Return the text content of a screenshot
screenshotServiceRouter.get(
  screenshotContentQueryEndpoint,
  zValidator("param", getScreenshotParamSchema),
  async (c) => {
    try {
      const { hash, weekNumber, runId } = c.req.valid("param");

      const { screenshotService } = initializeServices(c);
      const object = await screenshotService.getScreenshotContent(
        hash,
        weekNumber,
        runId
      );

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

export default screenshotServiceRouter;
