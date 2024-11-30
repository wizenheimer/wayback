// src/routes/workflow.ts

import { Hono } from "hono";
import {
  diffWorkflowEndpoint,
  reportWorkflowEndpoint,
  workflowStatusEndpoint,
} from "../constants";
import { zValidator } from "@hono/zod-validator";
import {
  competitorReportWorkflowSchema,
  screenshotDiffWorkflowSchema,
  workflowStatusQuerySchema,
} from "../schema";
import { getWeekNumber } from "../utils/path";
import { Bindings } from "../types/core";
// =======================================================
//                Workflow Service Endpoints
// =======================================================

const workflowServiceRouter = new Hono<{ Bindings: Bindings }>();

workflowServiceRouter.post(
  diffWorkflowEndpoint,
  zValidator("json", screenshotDiffWorkflowSchema),
  async (c) => {
    try {
      const { url, runId, weekNumber: requestedWeek } = await c.req.json();

      // Use provided week number or get current week
      const weekNumber = requestedWeek || getWeekNumber();

      // Create workflow instance
      const instance = await c.env.SCREENSHOT_DIFF_WORKFLOW.create({
        params: {
          url,
          runId,
          weekNumber,
        },
      });

      return c.json({
        status: "success",
        data: {
          workflowId: instance.id,
          url,
          runId,
          weekNumber,
          status: await instance.status(),
        },
      });
    } catch (error) {
      console.error("Workflow creation error:", error);
      return c.json(
        {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to create workflow",
        },
        500
      );
    }
  }
);

workflowServiceRouter.post(
  reportWorkflowEndpoint,
  zValidator("json", competitorReportWorkflowSchema),
  async (c) => {
    try {
      const input = await c.req.json();

      // Create workflow instance
      const instance = await c.env.COMPETITOR_REPORT_WORKFLOW.create({
        params: input,
      });

      return c.json({
        status: "success",
        data: {
          workflowId: instance.id,
          input,
          status: await instance.status(),
        },
      });
    } catch (error) {
      console.error("Workflow creation error:", error);
      return c.json(
        {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to create workflow",
        },
        500
      );
    }
  }
);

workflowServiceRouter.get(
  workflowStatusEndpoint,
  zValidator("query", workflowStatusQuerySchema),
  async (c) => {
    const { id, workflowType } = c.req.valid("query");

    try {
      if (workflowType === "diff") {
        const instance = await c.env.SCREENSHOT_DIFF_WORKFLOW.get(id);
        const status = await instance.status();

        return c.json({
          status: "success",
          data: {
            workflowId: id,
            type: "screenshot",
            status: {
              state: status.status,
              error: status.error,
              output: status.output,
            },
          },
        });
      } else {
        const instance = await c.env.COMPETITOR_REPORT_WORKFLOW.get(id);
        const status = await instance.status();

        return c.json({
          status: "success",
          data: {
            workflowId: id,
            type: "competitor",
            status: {
              state: status.status,
              error: status.error,
              output: status.output,
            },
          },
        });
      }
    } catch (error) {
      console.error("Workflow status error:", error);
      return c.json(
        {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch workflow status",
        },
        500
      );
    }
  }
);

export default workflowServiceRouter;
