// src/workflow/report.ts
import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";
import { Bindings } from "../types/core";
import { NonRetryableError } from "cloudflare:workflows";
import { reportToEmailParams } from "../utils/email";
import { StorageService } from "../service/storage";
import { ScreenshotService } from "../service/screenshot";
import { DBService } from "../service/db";
import { AIService } from "../service/ai";
import { DiffService } from "../service/diff";
import { CompetitorService } from "../service/competitor";
import { SubscriptionService } from "../service/subscription";
import { NotificationService } from "../service/notification";

export class CompetitorReportWorkflow extends WorkflowEntrypoint<
  Bindings,
  CommpetitorReportWorkflowParams
> {
  async run(
    event: WorkflowEvent<CommpetitorReportWorkflowParams>,
    step: WorkflowStep
  ) {
    const { competitorId, runId1, runId2, weekNumber } = event.payload;

    // Step 1: Get competitor details and subscribers
    const { competitor } = await step.do(
      "fetch-competitor-details",
      {
        retries: {
          limit: 3,
          delay: "10 seconds",
          backoff: "exponential",
        },
        timeout: "30 seconds",
      },
      async () => {
        const { competitorService } = this.initializeServices();

        // Get competitor details
        const competitor = await competitorService.getCompetitor(competitorId);
        if (!competitor) {
          throw new NonRetryableError(
            `Competitor with ID ${competitorId} not found`
          );
        }

        return { competitor };
      }
    );

    // Step 2: Get subscribers for the competitor
    const { subscribers } = await step.do(
      "fetch-subscriber-details",
      {
        retries: {
          limit: 3,
          delay: "10 seconds",
          backoff: "exponential",
        },
        timeout: "30 seconds",
      },
      async () => {
        const { subscriptionService } = this.initializeServices();

        // Get subscriber emails
        const subscribers =
          await subscriptionService.getSubscribersByCompetitor(competitorId);

        return { subscribers };
      }
    );

    // Step 3: Generate report for all URLs
    const rawReport = await step.do(
      "fetch-report",
      {
        retries: {
          limit: 3,
          delay: "30 seconds",
          backoff: "exponential",
        },
        timeout: "5 minutes",
      },
      async () => {
        const { diffService } = this.initializeServices();

        const report = await diffService.generateReport({
          urls: competitor.urls,
          runId1,
          runId2,
          weekNumber,
          competitor: competitor.name,
          enriched: false, // Enable AI summaries
        });

        return report;
      }
    );

    // Step 4: Enrich report with AI summaries
    const enrichedReport = await step.do(
      "enrich-report",
      {
        retries: {
          limit: 3,
          delay: "30 seconds",
          backoff: "exponential",
        },
        timeout: "5 minutes",
      },
      async () => {
        const { aiService } = this.initializeServices();

        const enrichedReport = await aiService.enrichReport(rawReport);

        return enrichedReport;
      }
    );

    // Step 5: Send notifications to all subscribers
    if (subscribers.length > 0) {
      const notificationResults = await step.do(
        "send-notifications",
        {
          retries: {
            limit: 5,
            delay: "1 minute",
            backoff: "exponential",
          },
          timeout: "10 minutes",
        },
        async () => {
          const { notificationService } = this.initializeServices();
          const emailReport = reportToEmailParams(enrichedReport);

          const results = await notificationService.sendNotification({
            templateId: "diff-report",
            emailTemplateParams: emailReport,
            emails: subscribers,
          });

          return results;
        }
      );

      return {
        status: "success",
        competitor,
        enrichedReport,
        notifications: notificationResults,
        metadata: {
          subscriberCount: subscribers.length,
          successfulNotifications: notificationResults.email.successful.length,
          failedNotifications: notificationResults.email.failed.length,
        },
      };
    }

    // Return results without notifications if no subscribers
    return {
      status: "success",
      competitor,
      enrichedReport,
      metadata: {
        subscriberCount: 0,
        message: "No subscribers found for this competitor",
      },
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

    const competitorService = new CompetitorService(this.env.COMPETITOR_DB);
    const subscriptionService = new SubscriptionService(this.env.COMPETITOR_DB);
    const notificationService = new NotificationService({
      resend: {
        apiKey: this.env.RESEND_API_KEY,
        fromEmail: this.env.FROM_EMAIL,
      },
    });

    return {
      competitorService,
      subscriptionService,
      diffService,
      aiService,
      notificationService,
    };
  }
}
