// src/utils/initializer.ts
import { DBService } from "../service/db";
import { ScreenshotService } from "../service/screenshot";
import { StorageService } from "../service/storage";
import { AIService } from "../service/ai";

const initializeServices = (c: any) => {
  const storage = new StorageService(c.env.archive);
  const screenshot = new ScreenshotService(
    c.env.SCREENSHOT_SERVICE_API_KEY,
    c.env.SCREENSHOT_SERVICE_ORIGIN,
    storage
  );
  const db = new DBService(c.env.DB);
  const ai = new AIService(c.env.OPENAI_API_KEY);
  return { storage, screenshot, db, ai };
};

export { initializeServices };
