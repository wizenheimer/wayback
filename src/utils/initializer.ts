// src/utils/initializer.ts
import { DBService } from "../service/db";
import { ScreenshotService } from "../service/screenshot";
import { StorageService } from "../service/storage";
import { AIService } from "../service/ai";
import { CompetitorService } from "../service/competitor";
import { DiffService } from "../service/diff";
import { NotificationService } from "../service/notification";
import { SubscriptionService } from "../service/subscription";

// Initializes core services
const initializeServices = (c: any) => {
  // Initialize Screenshot Service
  const storage = new StorageService(c.env.archive);
  const screenshotService = new ScreenshotService(
    c.env.SCREENSHOT_SERVICE_API_KEY,
    c.env.SCREENSHOT_SERVICE_ORIGIN,
    storage
  );

  // Initialize Competitor Service
  const competitorService = new CompetitorService(c.env.COMPETITOR_DB);

  // Initialize Diff Service
  const diffDB = new DBService(c.env.DIFF_DB);
  const aiService = new AIService(c.env.OPENAI_API_KEY);
  const diffService = new DiffService(screenshotService, diffDB, aiService);

  // Initialize Subscription Service (using same DB as competitors)
  const subscriptionService = new SubscriptionService(c.env.COMPETITOR_DB);

  // Initialize Notification Service
  const notificationService = new NotificationService({
    resend: {
      apiKey: c.env.RESEND_API_KEY,
      fromEmail: c.env.FROM_EMAIL,
    },
  });

  return {
    aiService,
    screenshotService,
    diffService,
    competitorService,
    subscriptionService,
    notificationService,
  };
};

export { initializeServices };
