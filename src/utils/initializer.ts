// src/utils/initializer.ts
import { DBService } from "../service/db";
import { ScreenshotService } from "../service/screenshot";
import { StorageService } from "../service/storage";
import { AIService } from "../service/ai";
import { CompetitorService } from "../service/competitor";

const initializeServices = (c: any) => {
  const storage = new StorageService(c.env.archive);
  const screenshot = new ScreenshotService(
    c.env.SCREENSHOT_SERVICE_API_KEY,
    c.env.SCREENSHOT_SERVICE_ORIGIN,
    storage
  );
  const diffDB = new DBService(c.env.DIFF_DB);
  const ai = new AIService(c.env.OPENAI_API_KEY);
  const competitor = new CompetitorService(c.env.COMPETITOR_DB);
  return { screenshot, diffDB, ai, competitor };
};

export { initializeServices };
