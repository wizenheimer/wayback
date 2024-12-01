// src/index.ts
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { swaggerUI } from "@hono/swagger-ui";
import { openApiSpec } from "./openapi";
import { Bindings, QueueMessage } from "./types/core";
import {
  baseStub,
  competitorsBaseEndpoint,
  diffBaseEndpoint,
  docsStub,
  notificationBaseEndpoint,
  screenshotBaseEndpoint,
  workflowBaseEndpoint,
} from "./constants";
import { CompetitorReportWorkflow } from "./workflow/report";
import { ScreenshotDiffWorkflow } from "./workflow/diff";
import screenshotServiceRouter from "./routes/screenshot";
import workflowServiceRouter from "./routes/workflow";
import notificationServiceRouter from "./routes/notification";
import competitorServiceRouter from "./routes/competitor";
import diffServiceRouter from "./routes/diff";
import subscriptionServiceRouter from "./routes/subscription";
import { getWeekNumber } from "./utils/path";

// =======================================================
//              Initialize Hono
// =======================================================
const app = new Hono<{ Bindings: Bindings }>();

// =======================================================
//                 Authentication Middleware
// =======================================================

app.use(`${baseStub}/*`, async (c, next) => {
  const bearer = bearerAuth({ token: c.env.WAYBACK_API_TOKEN });
  return bearer(c, next);
});

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
//                 Service Endpoints
// =======================================================
app.route(screenshotBaseEndpoint, screenshotServiceRouter);
app.route(diffBaseEndpoint, diffServiceRouter);
app.route(competitorsBaseEndpoint, competitorServiceRouter);
app.route(competitorsBaseEndpoint, subscriptionServiceRouter);
app.route(notificationBaseEndpoint, notificationServiceRouter);
app.route(workflowBaseEndpoint, workflowServiceRouter);

// =======================================================
//                 Exports
// =======================================================

export default {
  fetch: app.fetch,
  async scheduled(
    controller: ScheduledController,
    env: Bindings,
    ctx: ExecutionContext
  ) {
    // Use if-else instead of switch-case for cron matching
    switch (controller.cron) {
      case "0 0 * * SUN":
        // Day: Sunday
        // Trigger the screenshot diff workflow with runID 1
        ctx.waitUntil(
          env.diff_queue.send(
            {
              url: "https://commonroom.io",
              runId: 1,
            },
            { delaySeconds: 60 }
          )
        );

      case "0 0 * * SAT":
        // Day: Saturday
        // Trigger the screenshot diff workflow with runID 7
        ctx.waitUntil(
          env.diff_queue.send(
            {
              url: "https://commonroom.io",
              runId: 7,
            },
            { delaySeconds: 60 }
          )
        );

      case "0 14 * * 1":
        // Day: Monday
        // US East: 9:00 AM EST (start of week)
        // US West: 6:00 AM PST (early morning)
        // UK: 2:00 PM GMT (afternoon)
        // Europe: 3:00 PM CET (afternoon)
        // India: 7:30 PM IST (evening)
        // China/Singapore: 10:00 PM CST/SGT (night)
        const previousWeekNumber = String(
          getWeekNumber(new Date(new Date().setDate(new Date().getDate() - 7)))
        );
        ctx.waitUntil(
          env.report_queue.send(
            {
              competitorId: 1,
              runId1: 1,
              runId2: 7,
              weekNumber: previousWeekNumber,
            },
            { delaySeconds: 60 }
          )
        );
    }
  },
  async queue(batch: MessageBatch<QueueMessage>, env: Bindings): Promise<void> {
    // Process the batch of messages depending on the queue
    for (const message of batch.messages) {
      try {
        // Extract the message body
        const msg = message.body;

        // Process the message based on the type
        let workflowEvent;
        if (batch.queue === "diff-queue") {
          const { url, runId } = msg;
          workflowEvent = env.SCREENSHOT_DIFF_WORKFLOW.create({
            params: {
              url: url,
              runId: runId,
            },
          });
        } else if (batch.queue === "report-queue") {
          const { competitorId, runId1, runId2, weekNumber } = msg;
          workflowEvent = env.COMPETITOR_REPORT_WORKFLOW.create({
            params: {
              competitorId: competitorId,
              runId1: runId1,
              runId2: runId2,
              weekNumber: weekNumber,
            },
          });
        } else {
          console.error("No handler for queue message");
        }

        // Acknowledge the message and wait for the workflow to complete
        message.ack();

        // Trigger the workflow event
        if (workflowEvent) {
          await workflowEvent;
        } else {
          console.error("No handler for queue message");
          throw new Error("No handler for queue message");
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    }
  },
};

export { ScreenshotDiffWorkflow, CompetitorReportWorkflow };
