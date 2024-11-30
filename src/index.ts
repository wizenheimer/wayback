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
};

export { ScreenshotDiffWorkflow, CompetitorReportWorkflow };
