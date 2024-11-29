// src/types/email.ts

export interface BaseEmailTemplateParameters {
  kind: string;
}

export interface DiffReportEmailParameters extends BaseEmailTemplateParameters {
  kind: "diff-report";
  competitor: string;
  fromDate: string;
  toDate: string;
  data: {
    branding: {
      summary: string;
      changes: string[];
      urls: Record<string, string[]>;
    };
    integration: {
      summary: string;
      changes: string[];
      urls: Record<string, string[]>;
    };
    pricing: {
      summary: string;
      changes: string[];
      urls: Record<string, string[]>;
    };
    positioning: {
      summary: string;
      changes: string[];
      urls: Record<string, string[]>;
    };
    product: {
      summary: string;
      changes: string[];
      urls: Record<string, string[]>;
    };
    partnership: {
      summary: string;
      changes: string[];
      urls: Record<string, string[]>;
    };
  };
}

export interface Trial0DayEmailParameters extends BaseEmailTemplateParameters {
  kind: "trial-0-day";
  userName?: string;
  upgradeLink: string;
}

export interface Trial3DayEmailParameters extends BaseEmailTemplateParameters {
  kind: "trial-3-day";
  userName?: string;
  upgradeLink: string;
}

export interface Trial7DayEmailParameters extends BaseEmailTemplateParameters {
  kind: "trial-7-day";
  userName?: string;
  upgradeLink: string;
}

export interface Trial14DayEmailParameters extends BaseEmailTemplateParameters {
  kind: "trial-14-day";
  userName?: string;
  upgradeLink: string;
}

export interface SuccessfulConversionEmailParameters
  extends BaseEmailTemplateParameters {
  kind: "successful-conversion";
  userName?: string;
}

export interface FailedConversionEmailParameters
  extends BaseEmailTemplateParameters {
  kind: "failed-conversion";
  userName?: string;
  upgradeLink: string;
}

export interface WaitlistOffboardingEmailParameters
  extends BaseEmailTemplateParameters {
  kind: "waitlist-offboarding";
  userName?: string;
  inviteLink: string;
}

export interface WaitlistOnboardingEmailParameters
  extends BaseEmailTemplateParameters {
  kind: "waitlist-onboarding";
  userName?: string;
}

export type EmailTemplateParameters =
  | DiffReportEmailParameters
  | Trial0DayEmailParameters
  | Trial3DayEmailParameters
  | Trial7DayEmailParameters
  | Trial14DayEmailParameters
  | SuccessfulConversionEmailParameters
  | FailedConversionEmailParameters
  | WaitlistOffboardingEmailParameters
  | WaitlistOnboardingEmailParameters;

export interface EmailTemplateMap {
  "diff-report": DiffReportEmailParameters;
  "trial-0-day": Trial0DayEmailParameters;
  "trial-3-day": Trial3DayEmailParameters;
  "trial-7-day": Trial7DayEmailParameters;
  "trial-14-day": Trial14DayEmailParameters;
  "successful-conversion": SuccessfulConversionEmailParameters;
  "failed-conversion": FailedConversionEmailParameters;
  "waitlist-offboarding": WaitlistOffboardingEmailParameters;
  "waitlist-onboarding": WaitlistOnboardingEmailParameters;
}

export type EmailTemplateId = keyof EmailTemplateMap;
