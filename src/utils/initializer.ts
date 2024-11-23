// src/utils/initializer.ts

import { ScreenshotService } from "../service/screenshot";
import { StorageService } from "../service/storage";

const initializeServices = (c: any) => {
  const storage = new StorageService(c.env.archive);
  const screenshot = new ScreenshotService(
    c.env.SCREENSHOT_SERVICE_API_KEY,
    c.env.SCREENSHOT_SERVICE_ORIGIN,
    storage
  );
  return { storage, screenshot };
};

export { initializeServices };
