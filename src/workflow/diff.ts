// src/workflow/diff.ts
import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";
import { Bindings } from "../types/core";
import { DEFAULT_SCREENSHOT_OPTIONS } from "../config";
import { NonRetryableError } from "cloudflare:workflows";
import { StorageService } from "../service/storage";
import { ScreenshotService } from "../service/screenshot";
import { DBService } from "../service/db";
import { AIService } from "../service/ai";
import { DiffService } from "../service/diff";
import { log } from "../utils/log";

export class ScreenshotDiffWorkflow extends WorkflowEntrypoint<
  Bindings,
  ScreenshotDiffWorkflowParams
> {
  async run(
    event: WorkflowEvent<ScreenshotDiffWorkflowParams>,
    step: WorkflowStep
  ) {
    const { url, runId, weekNumber } = event.payload;

    // Calculate comparison week and run ID
    const { comparisonWeek, comparisonRunId } = this.getComparisonDetails(
      weekNumber,
      runId
    );

    log(
      "Received params for diff workflow",
      url,
      runId,
      weekNumber,
      comparisonWeek,
      comparisonRunId
    );

    // Step 1: Take and store screenshot
    const screenshotResult = await step.do(
      "take-screenshot",
      {
        retries: {
          limit: 2,
          delay: "3 seconds",
          backoff: "exponential",
        },
        timeout: "2 minutes",
      },
      async () => {
        const { screenshotService } = this.initializeServices();

        const result = await screenshotService.takeScreenshot({
          ...DEFAULT_SCREENSHOT_OPTIONS,
          url,
          runId: runId,
          metadataContent: true,
        });

        if (!result.paths) {
          log("Screenshot failed: No paths returned");
          throw new Error("Screenshot failed: No paths returned");
        }

        log("Screenshot taken and stored successfully", result.paths);
        return result;
      }
    );

    // Step 2: Create diff analysis with the comparison version
    const diffResult = await step.do(
      "create-diff",
      {
        retries: {
          limit: 2,
          delay: "3 seconds",
          backoff: "exponential",
        },
        timeout: "5 minutes",
      },
      async () => {
        const { diffService } = this.initializeServices();

        let result = null;

        try {
          result = await diffService.createDiff({
            url,
            runId1: comparisonRunId,
            runId2: runId,
            weekNumber1: comparisonWeek,
            weekNumber2: weekNumber,
          });
          log("Diff analysis completed successfully", result);
        } catch (error) {
          log("Diff analysis failed", error);
          if (error instanceof Error) {
            // Check the error message
            switch (error.message) {
              case "No content versions found":
                // Handle this specific case
                throw new NonRetryableError("No content versions found");
              case "Second content version not found":
                // Handle this specific case
                throw new NonRetryableError("Second content version not found");
              case "First content version not found":
                // Handle this specific case
                throw new NonRetryableError("First content version not found");
              default:
                // Rethrow the error, intermitent issue
                throw error;
            }
          }
        }

        if (!result?.differences) {
          log("No differences detected between versions");
          throw new NonRetryableError(
            "No differences detected between versions"
          );
        }

        return result;
      }
    );

    return {
      status: "success",
      message: "Screenshot taken and diff analysis completed successfully",
      currentVersion: {
        weekNumber,
        runId,
        paths: screenshotResult.paths,
      },
      comparisonVersion: {
        weekNumber: comparisonWeek,
        runId: comparisonRunId,
      },
      diff: diffResult,
    };
  }

  private initializeServices() {
    const storage = new StorageService(this.env.archive);
    const screenshotService = new ScreenshotService(
      this.env.SCREENSHOT_SERVICE_API_KEY,
      this.env.SCREENSHOT_SERVICE_ORIGIN,
      storage
    );

    const diffDB = new DBService(this.env.DIFF_DB);
    const aiService = new AIService(this.env.OPENAI_API_KEY);
    const diffService = new DiffService(screenshotService, diffDB, aiService);

    return {
      screenshotService,
      diffService,
    };
  }

  private getComparisonDetails(weekNumber: string, runId: string) {
    const weekNum = parseInt(weekNumber);

    if (runId === "7") {
      // For runId 7, compare with runId 1 from same week
      return {
        comparisonWeek: weekNumber.padStart(2, "0"),
        comparisonRunId: "1",
      };
    } else {
      // For runId 1, compare with runId 2 from previous week
      const prevWeek =
        weekNum - 1 > 0 ? (weekNum - 1).toString().padStart(2, "0") : "52";
      return {
        comparisonWeek: prevWeek,
        comparisonRunId: "7",
      };
    }
  }
}
