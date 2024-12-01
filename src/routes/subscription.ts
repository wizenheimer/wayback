import { Hono } from "hono";
import { Bindings } from "hono/types";
import { subscribeCompetitorEndpoint } from "../constants";
import { zValidator } from "@hono/zod-validator";
import { subscriptionSchema } from "../schema";
import { initializeServices } from "../utils/initializer";
import { log } from "../utils/log";

// =======================================================
//                Subscription Service Endpoints
// =======================================================

// src/routes/subscription.ts
const subscriptionServiceRouter = new Hono<{ Bindings: Bindings }>();

// Subscribe to competitor updates
subscriptionServiceRouter.post(
  subscribeCompetitorEndpoint,
  zValidator("json", subscriptionSchema),
  async (c) => {
    try {
      const id = parseInt(c.req.param("id"));
      const { email } = await c.req.json();
      log("Received subscription params", id, email);

      const { subscriptionService, competitorService } = initializeServices(c);

      // Verify competitor exists
      const competitor = await competitorService.getCompetitor(id);
      log("Got competitor object", competitor);

      if (!competitor) {
        return c.json(
          {
            status: "error",
            error: "Competitor not found",
          },
          404
        );
      }

      const subscription = await subscriptionService.subscribe(id, email);
      log("Got subscription object", subscription);

      return c.json({
        status: "success",
        data: subscription,
      });
    } catch (error) {
      console.error("Subscription error:", error);

      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        return c.json(
          {
            status: "error",
            error: "Already subscribed to this competitor",
          },
          409
        );
      }

      return c.json(
        {
          status: "error",
          error: error instanceof Error ? error.message : "Failed to subscribe",
        },
        500
      );
    }
  }
);

// Unsubscribe from competitor updates
subscriptionServiceRouter.delete(subscribeCompetitorEndpoint, async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const email = c.req.query("email");
    log("Received params for subscription deletion", id, email);

    if (!email) {
      return c.json(
        {
          status: "error",
          error: "Email parameter is required",
        },
        400
      );
    }

    const { subscriptionService, competitorService } = initializeServices(c);

    // Verify competitor exists
    const competitor = await competitorService.getCompetitor(id);
    log("Queried competitor", competitor);

    if (!competitor) {
      return c.json(
        {
          status: "error",
          error: "Competitor not found",
        },
        404
      );
    }

    await subscriptionService.unsubscribe(id, email);
    log("Unscribed from competitor");

    return c.json({
      status: "success",
      message: "Successfully unsubscribed",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return c.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Failed to unsubscribe",
      },
      500
    );
  }
});

// Get all subscribers for a competitor
subscriptionServiceRouter.get(subscribeCompetitorEndpoint, async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    log("Got subscription param", id);

    const { subscriptionService, competitorService } = initializeServices(c);

    // Verify competitor exists
    const competitor = await competitorService.getCompetitor(id);
    log("Retrieved competitor object", competitor);

    if (!competitor) {
      return c.json(
        {
          status: "error",
          error: "Competitor not found",
        },
        404
      );
    }

    const subscribers = await subscriptionService.getSubscribersByCompetitor(
      id
    );
    log("Got subscribers list", subscribers);

    return c.json({
      status: "success",
      data: subscribers,
    });
  } catch (error) {
    console.error("Get subscribers error:", error);
    return c.json(
      {
        status: "error",
        error:
          error instanceof Error ? error.message : "Failed to get subscribers",
      },
      500
    );
  }
});

export default subscriptionServiceRouter;
