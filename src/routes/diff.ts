// src/routes/diff.ts

import { Hono } from "hono";
import { Bindings } from "../types/core";
import {
  diffCreationEndpoint,
  diffHistoryEndpoint,
  reportCreationEndpoint,
} from "../constants";
import {
  diffRequestSchema,
  historyQuerySchema,
  reportRequestSchema,
} from "../schema";
import { zValidator } from "@hono/zod-validator";
import { initializeServices } from "../utils/initializer";
import { log } from "../utils/log";

// =======================================================
//              Diff Analysis Endpoints
// =======================================================

const diffServiceRouter = new Hono<{ Bindings: Bindings }>();

// Generate a diff for a given url between any two content versions
// This requires the content to be stored in the storage service
// Update the diff creation endpoint
diffServiceRouter.post(
  diffCreationEndpoint,
  zValidator("json", diffRequestSchema),
  async (c) => {
    try {
      const { url, runId1, runId2, weekNumber1, weekNumber2 } =
        await c.req.json();
      log("Diff analysis request received", { url, runId1, runId2 });

      const { diffService } = initializeServices(c);
      log("Diff service initialized with storage and AI services");

      const result = await diffService.createDiff({
        url,
        runId1,
        runId2,
        weekNumber1,
        weekNumber2,
      });
      log("Diff analysis completed with", result);

      return c.json({
        status: "success",
        data: result,
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

// Query diff for a given URL between any two content versions
// This requires the content to be stored in the storage service
diffServiceRouter.get(
  diffHistoryEndpoint,
  zValidator("query", historyQuerySchema),
  async (c) => {
    try {
      const { url, fromRunId, toRunId, weekNumber, limit } =
        c.req.valid("query");
      const { diffService } = initializeServices(c);

      const result = await diffService.getDiffHistory({
        url,
        fromRunId,
        toRunId,
        weekNumber,
        limit,
      });

      return c.json({
        status: "success",
        data: result,
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

// Query and aggregate diffs for a list of URLs within a time range
// This requires the content to be stored in the storage service
// Generate aggregated report for multiple URLs
diffServiceRouter.post(
  reportCreationEndpoint,
  zValidator("json", reportRequestSchema),
  async (c) => {
    try {
      const { urls, runId1, runId2, weekNumber, enriched, competitor } =
        await c.req.json();
      const { diffService } = initializeServices(c);

      const aggregatedReport = await diffService.generateReport({
        urls,
        runId1,
        runId2,
        weekNumber,
        enriched,
        competitor,
      });

      return c.json({
        status: "success",
        data: aggregatedReport,
      });
    } catch (error) {
      console.error("Report generation error:", error);
      return c.json(
        {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate report",
        },
        500
      );
    }
  }
);

export default diffServiceRouter;
