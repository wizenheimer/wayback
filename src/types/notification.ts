// src/types/notification.ts

import { EmailTemplateId, EmailTemplateMap } from "./email";

export interface NotificationRequest<T extends EmailTemplateId> {
  templateId: T;
  emailTemplateParams: EmailTemplateMap[T];
  emails: string[];
}

export interface NotificationResults {
  email: {
    successful: string[];
    failed: string[];
  };
}

export interface NotificationServiceConfig {
  resend: {
    apiKey: string;
    fromEmail: string;
    replyTo?: string;
  };
}

export interface Subscription {
  id: number;
  competitor_id: number;
  email: string;
  created_at: string;
  status: "active" | "unsubscribed";
}
