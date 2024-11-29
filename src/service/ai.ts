// src/service/ai.ts

import OpenAI from "openai";
import { AggregatedReport, CategoryEnriched, DiffAnalysis } from "../types";

export class AIService {
  private readonly openai: OpenAI;

  constructor(private apiKey: string) {
    this.openai = new OpenAI({ apiKey: this.apiKey });
  }

  async analyzeDifferences(
    content1: string,
    content2: string
  ): Promise<DiffAnalysis> {
    try {
      const response = await this.openai.beta.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: "Analyze the content for changes across branding, integration, pricing, product, positioning, and partnership categories.\n# Process\n1. Review content for changes in:\n1.1 Branding: Visual identity, logos, website design, brand assets\n1.2 Integration: New/removed integrations, integration updates\n1.3 Pricing: Costs, tiers, promotional offers\n1.4 Product: Features, updates, removals, modifications\n1.5 Positioning: Market messaging, target audience, value proposition\n1.6 Partnerships: New/terminated partnerships, program changes\n2. For each change identified:\n2.1 Document the specific change with clear description\n2.2 For changes found:\n2.2.1 Start with action verbs or clear transition phrases\n2.2.2 List each change as a complete, detailed statement\n2.2.3 Include relevant context (numbers, timeframes, features)\n2.2.4 Separate related but distinct changes into individual items\n2.2.5 Structure complex changes into bullet points when needed",
              },
            ],
          },
          {
            role: "user",
            content: `Compare these two versions of content and identify changes:\n\nVersion 1:\n${content1}\n\nVersion 2:\n${content2}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "competitive_intelligence_tracking",
            strict: true,
            schema: {
              type: "object",
              properties: {
                branding: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  changes: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description:
                      "List of branding changes including visual identity, logo, website, or other brand assets",
                  },
                },
                integration: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  changes: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description:
                      "List of new integrations, removed integrations, or integration updates",
                  },
                },
                pricing: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  changes: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description:
                      "List of detected pricing changes, e.g. price increases, new tiers, promotional offers",
                  },
                },
                product: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  changes: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description:
                      "List of product updates, new features, removals, or modifications",
                  },
                },
                positioning: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  changes: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description:
                      "List of changes in market positioning, messaging, or target audience",
                  },
                },
                partnership: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  changes: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description:
                      "List of new partnerships, terminated partnerships, or partnership program changes",
                  },
                },
              },
              required: [
                "pricing",
                "product",
                "positioning",
                "partnership",
                "branding",
                "integration",
              ],
              additionalProperties: false,
            },
          },
        },
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const diffResponse = response.choices[0].message;
      if (diffResponse.parsed) {
        return diffResponse.parsed;
      }
      throw new Error("diff analysis refused");
    } catch (error) {
      console.error("Diff analysis error:", error);
      throw error;
    }
  }

  async enrichReport(report: AggregatedReport): Promise<AggregatedReport> {
    try {
      const response = await this.openai.beta.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: "You're a morning brew copywriter with this personality. Voice: Sharp advisor who distills competitor moves into one liners. Style: Think Peter Thiel meets Palmer Luckey - insightful with personality. Tone: Human. Conversational. Simple words. Zero jargon. Zero corporate speak.Analyze the competitive intelligence and provide concise summaries for each category of changes.",
              },
            ],
          },
          {
            role: "user",
            content: `Analyze this competitive intelligence report and provide summaries:\n${JSON.stringify(
              report,
              null,
              2
            )}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "competitive_intelligence_summaries",
            strict: true,
            schema: {
              type: "object",
              properties: {
                branding: {
                  type: "string",
                  description: "Summary for key branding changes",
                },
                integration: {
                  type: "string",
                  description: "Summary for key integration changes",
                },
                pricing: {
                  type: "string",
                  description: "Summary for key pricing changes",
                },
                positioning: {
                  type: "string",
                  description: "Summary for key positioning changes",
                },
                product: {
                  type: "string",
                  description: "Summary for key product changes",
                },
                partnership: {
                  type: "string",
                  description: "Summary for key partnership changes",
                },
              },
              required: [
                "branding",
                "integration",
                "pricing",
                "positioning",
                "product",
                "partnership",
              ],
              additionalProperties: false,
            },
          },
        },
        temperature: 0.3,
      });

      const summaries: any = response.choices[0].message.parsed;

      // Enrich each category with its summary
      const categories = [
        "branding",
        "integration",
        "pricing",
        "positioning",
        "product",
        "partnership",
      ] as const;
      categories.forEach((category) => {
        if (report.data[category].changes.length > 0) {
          (report.data[category] as CategoryEnriched).summary =
            summaries[category] || "No significant changes detected.";
        }
      });

      return report;
    } catch (error) {
      console.error("Report enrichment error:", error);
      throw error;
    }
  }
}
