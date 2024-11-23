import * as cheerio from "cheerio";

export const cleanHtmlContent = (html: string): string => {
  const $ = cheerio.load(html);

  // Remove non-content elements
  $("script").remove();
  $("style").remove();
  $("noscript").remove();
  $("iframe").remove();
  $("svg").remove();
  $("head").remove();

  // Get text content and clean it up
  return $("body").text().replace(/\s+/g, " ").replace(/\n+/g, "\n").trim();
};
