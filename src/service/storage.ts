import { generatePathHash, getDatePath } from "../utils/path";

export class StorageService {
  constructor(private bucket: R2Bucket) {}

  async storeScreenshot(
    url: string,
    data: ArrayBuffer,
    metadata: Record<string, any>
  ) {
    const urlHash = generatePathHash(url);
    const datePath = getDatePath();
    const screenshotPath = `screenshot/${urlHash}/${datePath}`;
    const contentPath = `content/${urlHash}/${datePath}`;

    await this.bucket.put(screenshotPath, data, {
      customMetadata: metadata,
    });

    return { screenshotPath, contentPath };
  }

  async storeContent(
    url: string,
    content: string,
    metadata: Record<string, any>
  ) {
    const urlHash = generatePathHash(url);
    const datePath = getDatePath();
    const contentPath = `content/${urlHash}/${datePath}`;

    await this.bucket.put(contentPath, content, {
      customMetadata: metadata,
    });

    console.log("Stored content", { contentPath, content });

    return contentPath;
  }

  async getScreenshot(path: string) {
    return await this.bucket.get(path);
  }

  async getContent(path: string) {
    return await this.bucket.get(path);
  }
}
