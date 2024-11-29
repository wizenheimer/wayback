// src/utils/url.ts

import { ScreenshotOptions } from "../types/screenshot";

export const createScreenshotUrl = (
  apiKey: string,
  origin: string,
  options: ScreenshotOptions
): string => {
  const params = new URLSearchParams();

  // Helper to add params, handling arrays correctly
  const addParam = (key: string, value: any) => {
    if (value === undefined || value === null) {
      return;
    }

    // Handle boolean values
    if (typeof value === "boolean") {
      params.append(key, value.toString());
      return;
    }

    // Handle arrays (multi-select parameters)
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v.toString()));
      return;
    }

    // Handle regular values
    params.append(key, value.toString());
  };

  // Essential parameters
  addParam("access_key", apiKey);
  addParam("url", options.url);
  addParam("format", options.format);
  addParam("response_type", "by_format");

  // Blocking options
  addParam("block_ads", options.blockAds);
  addParam("block_cookie_banners", options.blockCookieBanners);
  addParam("block_banners_by_heuristics", options.blockBannersByHeuristics);
  addParam("block_trackers", options.blockTrackers);
  addParam("block_chats", options.blockChats);

  // Resource blocking TBD
  if (options.blockResources) {
    options.blockResources.forEach((resource) => {
      addParam("block_resources", resource);
    });
  }

  // Timing options
  addParam("delay", options.delay);
  addParam("timeout", options.timeout);
  addParam("navigation_timeout", options.navigationTimeout);

  // Wait until options (multiple allowed)
  options.waitUntil?.forEach((wait) => {
    params.append("wait_until", wait);
  });

  // Script wait until options (multiple allowed)
  options.scriptWaitUntil?.forEach((wait) => {
    params.append("scripts_wait_until", wait);
  });

  // Selector options
  addParam("wait_for_selector", options.waitForSelector);
  addParam("wait_for_selector_algorithm", options.waitForSelectorAlgorithm);

  // Mode options
  addParam("dark_mode", options.darkMode);
  addParam("reduced_motion", options.reducedMotion);

  // Metadata options
  addParam("metadata_image_size", options.metadataImageSize);
  addParam("metadata_page_title", options.metadataPageTitle);
  addParam("metadata_content", options.metadataContent);
  addParam(
    "metadata_http_response_status_code",
    options.metadataHttpStatusCode
  );
  addParam(
    "metadata_http_response_status_headers",
    options.metadataHttpHeaders
  );

  // Capture options
  addParam("capture_beyond_viewport", options.captureBeyondViewport);
  addParam("full_page", options.fullPage);
  addParam("full_page_scroll", options.fullPageScroll);
  addParam("full_page_algorithm", options.fullPageAlgorithm || "default");
  addParam("image_quality", options.imageQuality);

  // Additional options if provided
  if (options.selector) addParam("selector", options.selector);
  if (options.scrollIntoView)
    addParam("scroll_into_view", options.scrollIntoView);
  if (options.hideSelectors?.length) {
    options.hideSelectors.forEach((selector) => {
      addParam("hide_selector", selector);
    });
  }
  if (options.blockRequests?.length) {
    options.blockRequests.forEach((pattern) => {
      addParam("block_request", pattern);
    });
  }

  return `${origin}/take?${params.toString()}`;
};
