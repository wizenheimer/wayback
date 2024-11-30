import { Hono } from "hono";
import { Bindings } from "hono/types";
import { subscribeCompetitorEndpoint } from "../constants";
import { zValidator } from "@hono/zod-validator";
import { subscriptionSchema } from "../schema";
import { initializeServices } from "../utils/initializer";

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

      const { subscriptionService, competitorService } = initializeServices(c);

      // Verify competitor exists
      const competitor = await competitorService.getCompetitor(id);
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

    const { subscriptionService, competitorService } = initializeServices(c);

    // Verify competitor exists
    const competitor = await competitorService.getCompetitor(id);
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
