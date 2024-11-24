// src/utils/initializer.ts
import { DBService } from "../service/db";
import { ScreenshotService } from "../service/screenshot";
import { StorageService } from "../service/storage";
import { AIService } from "../service/ai";
import { CompetitorService } from "../service/competitor";
import { DiffService } from "../service/diff";

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
  const ai = new AIService(c.env.OPENAI_API_KEY);
  const diffService = new DiffService(screenshotService, diffDB, ai);

  return { screenshotService, diffService, competitorService };
};

export { initializeServices };
