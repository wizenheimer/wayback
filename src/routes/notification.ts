// src/routes/notification.ts

import { Hono } from "hono";
import { Bindings } from "../types/core";
import { notifyEndpoint } from "../constants";
import { zValidator } from "@hono/zod-validator";
import { notificationSchema } from "../schema";
import { initializeServices } from "../utils/initializer";

const notificationServiceRouter = new Hono<{ Bindings: Bindings }>();

// =======================================================
//                Notifier Service Endpoints
// =======================================================
notificationServiceRouter.post(
  notifyEndpoint,
  zValidator("json", notificationSchema),
  async (c) => {
    try {
      const input = await c.req.json();
      const { notificationService } = initializeServices(c);

      const results = await notificationService.sendNotification(input);

      return c.json({
        status: "success",
        data: results,
      });
    } catch (error) {
      console.error("Notification error:", error);

      if (error instanceof Error) {
        return c.json(
          {
            status: "error",
            error: error.message,
          },
          error.name === "ValidationError" ? 400 : 500
        );
      }

      return c.json(
        {
          status: "error",
          error: "An unknown error occurred",
        },
        500
      );
    }
  }
);

export default notificationServiceRouter;
