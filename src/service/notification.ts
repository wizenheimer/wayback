// src/service/notification.ts
import { Resend } from "resend";
import {
  NotificationRequest,
  NotificationResults,
  NotificationServiceConfig,
} from "../types/notification";
import DiffReportEmail from "../templates/diff-report";
import Trial0DayEmail from "../templates/trial-0-day";
import Trial3DayEmail from "../templates/trial-3-days";
import Trial7DayEmail from "../templates/trial-7-days";
import Trial14DayEmail from "../templates/trial-14-day";
import SuccessfulConversionEmail from "../templates/trial-confirmation";
import FailedConversionEmail from "../templates/trial-renewal-failure";
import WaitlistOffboarding from "../templates/waitlist-offboarding";
import WaitlistOnboarding from "../templates/waitlist-onboarding";
import { EmailTemplateId, EmailTemplateParameters } from "../types/email";
import { getWeekNumber } from "../utils/path";

export class NotificationService {
  private readonly resend: Resend;
  private readonly config: NotificationServiceConfig;

  constructor(config: NotificationServiceConfig) {
    this.config = config;
    this.resend = new Resend(config.resend.apiKey);
  }

  private getEmailTemplate(params: EmailTemplateParameters) {
    switch (params.kind) {
      case "diff-report":
        return DiffReportEmail(params);
      case "trial-0-day":
        return Trial0DayEmail(params);
      case "trial-3-day":
        return Trial3DayEmail(params);
      case "trial-7-day":
        return Trial7DayEmail(params);
      case "trial-14-day":
        return Trial14DayEmail(params);
      case "successful-conversion":
        return SuccessfulConversionEmail(params);
      case "failed-conversion":
        return FailedConversionEmail(params);
      case "waitlist-offboarding":
        return WaitlistOffboarding(params);
      case "waitlist-onboarding":
        return WaitlistOnboarding(params);
      default:
        const _exhaustiveCheck: never = params;
        throw new Error(`Unhandled template kind: ${_exhaustiveCheck}`);
    }
  }

  private getEmailSubject(params: EmailTemplateParameters): string {
    const weekNumber = getWeekNumber();

    switch (params.kind) {
      case "diff-report":
        return `${params.competitor} Weekly Roundup #${weekNumber}`;
      case "trial-0-day":
        return "Your Competitor's Favorite Day is Tomorrow";
      case "trial-3-day":
        return "Power Move or Back to the Bench? Your Call";
      case "trial-7-day":
        return "You're Too Good for the Sidelines";
      case "trial-14-day":
        return "Your Next Win Makes Us Free - Not Kidding";
      case "successful-conversion":
        return "Thank you for sticking with us";
      case "failed-conversion":
        return "Missing You Already. Let's Talk";
      case "waitlist-offboarding":
        return "Welcome to Byrd";
      case "waitlist-onboarding":
        return "You're Almost There";
      default:
        const _exhaustiveCheck: never = params;
        throw new Error(`Unhandled template kind: ${_exhaustiveCheck}`);
    }
  }

  async sendNotification<T extends EmailTemplateId>(
    options: NotificationRequest<T>
  ): Promise<NotificationResults> {
    const results: NotificationResults = {
      email: {
        successful: [],
        failed: [],
      },
    };

    const emailTemplate = this.getEmailTemplate(options.emailTemplateParams);
    const emailSubject = this.getEmailSubject(options.emailTemplateParams);

    for (const email of options.emails) {
      try {
        await this.resend.emails.send({
          from: this.config.resend.fromEmail,
          to: email,
          subject: emailSubject,
          react: emailTemplate,
        });
        results.email.successful.push(email);
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        results.email.failed.push(email);
      }
    }

    return results;
  }
}
