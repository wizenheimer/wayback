// src/service/storage.ts

import { generatePathHash, getWeekNumber } from "../utils/path";

export class StorageService {
  constructor(private bucket: R2Bucket) {}

  async storeScreenshot(
    url: string,
    data: ArrayBuffer,
    runId: string,
    metadata: Record<string, any>
  ) {
    const urlHash = generatePathHash(url);
    const weekNumber = getWeekNumber();
    const screenshotPath = `screenshot/${urlHash}/${weekNumber}/${runId}`;
    const contentPath = `content/${urlHash}/${weekNumber}/${runId}`;

    await this.bucket.put(screenshotPath, data, {
      customMetadata: { ...metadata, weekNumber },
    });

    return { screenshotPath, contentPath };
  }

  async storeContent(
    url: string,
    content: string,
    runId: string,
    metadata: Record<string, any>
  ) {
    const urlHash = generatePathHash(url);
    const weekNumber = getWeekNumber();
    const contentPath = `content/${urlHash}/${weekNumber}/${runId}`;

    await this.bucket.put(contentPath, content, {
      customMetadata: { ...metadata, weekNumber },
    });

    return contentPath;
  }

  async getScreenshot(hash: string, weekNumber: string, runId: string) {
    const path = `screenshot/${hash}/${weekNumber}/${runId}`;
    return await this.bucket.get(path);
  }

  async getContent(hash: string, weekNumber: string, runId: string) {
    const path = `content/${hash}/${weekNumber}/${runId}`;
    return await this.bucket.get(path);
  }
}
