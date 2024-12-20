// src/service/screenshot.ts
import { createScreenshotUrl } from "../utils/url";
import { cleanHtmlContent } from "../utils/content";
import { StorageService } from "./storage";
import { generatePathHash } from "../utils/path";
import { ScreenshotMetadata, ScreenshotOptions } from "../types/screenshot";

export class ScreenshotService {
  constructor(
    private apiKey: string,
    private origin: string,
    private storage: StorageService
  ) {}

  async takeScreenshot(options: ScreenshotOptions) {
    const screenshotUrl = createScreenshotUrl(
      this.apiKey,
      this.origin,
      options
    );

    const { runId } = options;

    const response = await fetch(screenshotUrl);

    if (!response.ok) {
      throw new Error(`Screenshot failed: ${await response.text()}`);
    }

    const imageWidth = parseInt(
      response.headers.get("X-ScreenshotOne-Image-Width") || "0"
    );
    const imageHeight = parseInt(
      response.headers.get("X-ScreenshotOne-Image-Height") || "0"
    );
    const contentUrl = response.headers.get("X-ScreenshotOne-Content-URL");
    const pageTitle = response.headers.get("X-ScreenshotOne-Page-Title");

    const imageData = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Prepare Metadata
    const screenshotMetadata = {
      sourceUrl: options.url,
      fetchedAt: new Date().toISOString(),
      screenshotService: this.origin,
      options: JSON.stringify(options),
      imageWidth,
      imageHeight,
      pageTitle: pageTitle ? decodeURIComponent(pageTitle) : undefined,
    } as ScreenshotMetadata;

    // Store screenshot
    const { screenshotPath, contentPath } = await this.storage.storeScreenshot(
      options.url,
      imageData,
      runId,
      { ...screenshotMetadata, contentType }
    );

    // Process content if available
    if (contentUrl) {
      try {
        const contentResponse = await fetch(contentUrl);
        if (contentResponse.ok) {
          const htmlContent = await contentResponse.text();
          const cleanedContent = cleanHtmlContent(htmlContent);

          // Store content inside R2
          await this.storage.storeContent(options.url, cleanedContent, runId, {
            ...screenshotMetadata,
            sourceUrl: contentUrl,
            contentType: contentResponse.headers.get("content-type"),
          });
        }
      } catch (error) {
        console.error("Content processing failed:", error);
      }
    }

    return {
      paths: { screenshot: screenshotPath, content: contentPath },
      metadata: {
        imageWidth,
        imageHeight,
        pageTitle: pageTitle ? decodeURIComponent(pageTitle) : undefined,
      },
      size: imageData.byteLength,
      contentType,
    };
  }

  async getScreenshotImage(hash: string, weekNumber: string, runId: string) {
    return await this.storage.getScreenshot(hash, weekNumber, runId);
  }

  async getScreenshotContent(hash: string, weekNumber: string, runId: string) {
    return await this.storage.getContent(hash, weekNumber, runId);
  }

  async getScreenshotContentFromUrl(
    url: string,
    weekNumber: string,
    runId: string
  ) {
    const hash = generatePathHash(url);
    return await this.getScreenshotContent(hash, weekNumber, runId);
  }

  async getScreenshotImageFromUrl(
    url: string,
    weekNumber: string,
    runId: string
  ) {
    const hash = generatePathHash(url);
    return await this.getScreenshotImage(hash, weekNumber, runId);
  }
}
