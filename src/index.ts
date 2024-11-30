// src/index.ts
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { swaggerUI } from "@hono/swagger-ui";
import { openApiSpec } from "./openapi";
import { Bindings } from "./types/core";
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
    let workflowEvent;
    switch (controller.cron) {
      case "0 0 * * 0":
        // Day: Sunday
        // Trigger the screenshot diff workflow with runID 1
        console.log("Triggering screenshot diff workflow with runID 1");
        workflowEvent = env.SCREENSHOT_DIFF_WORKFLOW.create({
          params: {
            url: "https://commonroom.io",
            runId: 1,
          },
        });

      case "0 0 * * 6":
        // Day: Saturday
        // Trigger the screenshot diff workflow with runID 7
        console.log("Triggering screenshot diff workflow with runID 7");
        workflowEvent = env.SCREENSHOT_DIFF_WORKFLOW.create({
          params: {
            url: "https://commonroom.io",
            runId: 7,
          },
        });

      case "0 14 * * 1":
        // Day: Monday
        // US East: 9:00 AM EST (start of week)
        // US West: 6:00 AM PST (early morning)
        // UK: 2:00 PM GMT (afternoon)
        // Europe: 3:00 PM CET (afternoon)
        // India: 7:30 PM IST (evening)
        // China/Singapore: 10:00 PM CST/SGT (night)
        console.log("Triggering competitor report workflow");
        const weekNumber = String(
          getWeekNumber(new Date(new Date().setDate(new Date().getDate() - 7)))
        );
        workflowEvent = env.COMPETITOR_REPORT_WORKFLOW.create({
          params: {
            competitorID: 1,
            runId1: 1,
            runId2: 7,
            weekNumber: weekNumber,
          },
        });
    }
    ctx.waitUntil(workflowEvent!);
  },
};

export { ScreenshotDiffWorkflow, CompetitorReportWorkflow };
