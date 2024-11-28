// src/openapi.ts

export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Wayback API",
    version: "1.0.0",
    description:
      "Internal API to monitor and compare changes in webpages over time",
  },
  servers: [
    {
      url: "http://localhost:8787",
      description: "Development server",
    },
    {
      url: "https://wayback.byrdhq.workers.dev",
      description: "Production server",
    },
  ],
  paths: {
    "/api/v1/screenshot": {
      post: {
        summary: "Take a screenshot of a webpage",
        tags: ["Screenshot"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["url", "runId"],
                properties: {
                  url: {
                    type: "string",
                    format: "uri",
                    description: "URL of the webpage to screenshot",
                  },
                  runId: {
                    type: "string",
                    description: "User-defined identifier for this capture",
                  },
                  format: {
                    type: "string",
                    enum: ["jpg", "png", "webp"],
                    description: "Image format",
                  },
                  fullPage: {
                    type: "boolean",
                    description: "Capture full page",
                  },
                  darkMode: {
                    type: "boolean",
                    description: "Enable dark mode",
                  },
                  blockAds: {
                    type: "boolean",
                    description: "Block advertisements",
                  },
                  blockCookieBanners: {
                    type: "boolean",
                    description: "Block cookie consent banners",
                  },
                  blockTrackers: {
                    type: "boolean",
                    description: "Block tracking scripts",
                  },
                  delay: {
                    type: "integer",
                    description: "Delay in milliseconds before capture",
                  },
                  timezone: {
                    type: "string",
                    description: "Timezone for rendering",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Screenshot taken successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    paths: {
                      type: "object",
                      properties: {
                        screenshot: { type: "string" },
                        content: { type: "string" },
                      },
                    },
                    metadata: {
                      type: "object",
                      properties: {
                        imageWidth: { type: "number" },
                        imageHeight: { type: "number" },
                        pageTitle: { type: "string" },
                        weekNumber: { type: "string" },
                        runId: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request parameters",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["error"],
                    },
                    error: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Error taking screenshot",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["error"],
                    },
                    error: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/screenshot/{hash}/{weekNumber}/{runId}": {
      get: {
        summary: "Get a stored screenshot",
        tags: ["Screenshot"],
        parameters: [
          {
            name: "hash",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "URL hash",
          },
          {
            name: "weekNumber",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^\\d{2}$",
            },
            description: "Week number (01-53)",
          },
          {
            name: "runId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "Run identifier",
          },
          {
            name: "format",
            in: "query",
            schema: {
              type: "string",
              enum: ["base64", "binary", "json"],
              default: "base64",
            },
            description: "Response format",
          },
        ],
        responses: {
          "200": {
            description: "Screenshot retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "string",
                    },
                    metadata: {
                      type: "object",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Screenshot not found",
          },
        },
      },
    },
    "/api/v1/content/{hash}/{weekNumber}/{runId}": {
      get: {
        summary: "Get stored webpage content",
        tags: ["Content"],
        parameters: [
          {
            name: "hash",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "URL hash",
          },
          {
            name: "weekNumber",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^\\d{2}$",
            },
            description: "Week number (01-53)",
          },
          {
            name: "runId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "Run identifier",
          },
        ],
        responses: {
          "200": {
            description: "Content retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "string",
                    },
                    metadata: {
                      type: "object",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Content not found",
          },
        },
      },
    },
    "/api/v1/diff/create": {
      post: {
        summary: "Generate diff between two versions",
        tags: ["Diff"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["url", "runId1", "runId2"],
                properties: {
                  url: {
                    type: "string",
                    format: "uri",
                  },
                  runId1: {
                    type: "string",
                  },
                  runId2: {
                    type: "string",
                  },
                  weekNumber1: {
                    type: "string",
                    pattern: "^\\d{2}$",
                  },
                  weekNumber2: {
                    type: "string",
                    pattern: "^\\d{2}$",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Diff generated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "object",
                      properties: {
                        differences: {
                          type: "object",
                          properties: {
                            branding: {
                              type: "array",
                              items: { type: "string" },
                            },
                            integration: {
                              type: "array",
                              items: { type: "string" },
                            },
                            pricing: {
                              type: "array",
                              items: { type: "string" },
                            },
                            product: {
                              type: "array",
                              items: { type: "string" },
                            },
                            positioning: {
                              type: "array",
                              items: { type: "string" },
                            },
                            partnership: {
                              type: "array",
                              items: { type: "string" },
                            },
                          },
                        },
                        metadata: {
                          type: "object",
                          properties: {
                            url: { type: "string" },
                            runId1: { type: "string" },
                            runId2: { type: "string" },
                            weekNumber1: { type: "string" },
                            weekNumber2: { type: "string" },
                            analyzed_at: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/diff/history": {
      get: {
        summary: "Get diff history for a URL",
        tags: ["Diff"],
        parameters: [
          {
            name: "url",
            in: "query",
            required: true,
            schema: {
              type: "string",
              format: "uri",
            },
          },
          {
            name: "fromRunId",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "toRunId",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "weekNumber",
            in: "query",
            schema: {
              type: "string",
              pattern: "^\\d{2}$",
            },
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
            },
          },
        ],
        responses: {
          "200": {
            description: "History retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "object",
                      properties: {
                        results: {
                          type: "array",
                          items: {
                            type: "object",
                          },
                        },
                        metadata: {
                          type: "object",
                          properties: {
                            url: { type: "string" },
                            weekNumber: { type: "string" },
                            dateRange: {
                              type: "object",
                              properties: {
                                fromRun: { type: "string" },
                                toRun: { type: "string" },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/report": {
      post: {
        summary: "Generate aggregated report for multiple URLs",
        tags: ["Report"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["urls"],
                properties: {
                  urls: {
                    type: "array",
                    items: {
                      type: "string",
                      format: "uri",
                    },
                    minItems: 1,
                    maxItems: 100,
                  },
                  runId1: {
                    type: "string",
                  },
                  runId2: {
                    type: "string",
                  },
                  weekNumber: {
                    type: "string",
                    pattern: "^\\d{2}$",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Report generated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "object",
                      properties: {
                        branding: {
                          type: "object",
                          properties: {
                            changes: {
                              type: "array",
                              items: { type: "string" },
                            },
                            urls: {
                              type: "object",
                              additionalProperties: {
                                type: "array",
                                items: { type: "string" },
                              },
                            },
                          },
                        },
                        integration: {
                          type: "object",
                          properties: {
                            changes: {
                              type: "array",
                              items: { type: "string" },
                            },
                            urls: {
                              type: "object",
                              additionalProperties: {
                                type: "array",
                                items: { type: "string" },
                              },
                            },
                          },
                        },
                        pricing: {
                          type: "object",
                          properties: {
                            changes: {
                              type: "array",
                              items: { type: "string" },
                            },
                            urls: {
                              type: "object",
                              additionalProperties: {
                                type: "array",
                                items: { type: "string" },
                              },
                            },
                          },
                        },
                        metadata: {
                          type: "object",
                          properties: {
                            generatedAt: { type: "string" },
                            weekNumber: { type: "string" },
                            runRange: {
                              type: "object",
                              properties: {
                                fromRun: { type: "string" },
                                toRun: { type: "string" },
                              },
                            },
                            urlCount: { type: "number" },
                            processingStats: {
                              type: "object",
                              properties: {
                                totalUrls: { type: "number" },
                                successCount: { type: "number" },
                                failureCount: { type: "number" },
                                skippedCount: { type: "number" },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/competitors": {
      post: {
        summary: "Create a new competitor",
        tags: ["Competitors"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "domain", "urls"],
                properties: {
                  name: {
                    type: "string",
                    minLength: 1,
                  },
                  domain: {
                    type: "string",
                    minLength: 1,
                  },
                  urls: {
                    type: "array",
                    items: {
                      type: "string",
                      format: "uri",
                    },
                    minItems: 1,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Competitor created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        name: { type: "string" },
                        domain: { type: "string" },
                        urls: {
                          type: "array",
                          items: { type: "string" },
                        },
                        created_at: { type: "string" },
                        updated_at: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        summary: "List all competitors",
        tags: ["Competitors"],
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
          {
            name: "offset",
            in: "query",
            schema: {
              type: "integer",
              minimum: 0,
              default: 0,
            },
          },
        ],
        responses: {
          "200": {
            description: "Competitors retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "number" },
                          name: { type: "string" },
                          domain: { type: "string" },
                          urls: {
                            type: "array",
                            items: { type: "string" },
                          },
                          created_at: { type: "string" },
                          updated_at: { type: "string" },
                        },
                      },
                    },
                    metadata: {
                      type: "object",
                      properties: {
                        total: { type: "number" },
                        limit: { type: "number" },
                        offset: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/competitors/url": {
      get: {
        summary: "List competitor URLs with pagination",
        tags: ["Competitors"],
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
          {
            name: "offset",
            in: "query",
            schema: {
              type: "integer",
              minimum: 0,
              default: 0,
            },
          },
          {
            name: "domain_hash",
            in: "query",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "URLs retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "number" },
                          competitor_id: { type: "number" },
                          url: { type: "string" },
                          domain_hash: { type: "string" },
                          competitor_name: { type: "string" },
                          competitor_domain: { type: "string" },
                          created_at: { type: "string" },
                        },
                      },
                    },
                    metadata: {
                      type: "object",
                      properties: {
                        total: { type: "number" },
                        limit: { type: "number" },
                        offset: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/competitors/hash/{hash}": {
      get: {
        summary: "Find competitors by URL domain hash",
        tags: ["Competitors"],
        parameters: [
          {
            name: "hash",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Competitors found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "number" },
                          name: { type: "string" },
                          domain: { type: "string" },
                          urls: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                      },
                    },
                    metadata: {
                      type: "object",
                      properties: {
                        count: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/competitors/id/{id}": {
      get: {
        summary: "Get competitor by ID",
        tags: ["Competitors"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Competitor found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        name: { type: "string" },
                        domain: { type: "string" },
                        urls: {
                          type: "array",
                          items: { type: "string" },
                        },
                        created_at: { type: "string" },
                        updated_at: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Competitor not found",
          },
        },
      },
      put: {
        summary: "Update competitor",
        tags: ["Competitors"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  domain: { type: "string" },
                  urls: {
                    type: "array",
                    items: {
                      type: "string",
                      format: "uri",
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Competitor updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        name: { type: "string" },
                        domain: { type: "string" },
                        urls: {
                          type: "array",
                          items: { type: "string" },
                        },
                        created_at: { type: "string" },
                        updated_at: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete competitor",
        tags: ["Competitors"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Competitor deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/competitors/id/{id}/url": {
      post: {
        summary: "Add URL to competitor",
        tags: ["Competitors"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["url"],
                properties: {
                  url: {
                    type: "string",
                    format: "uri",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "URL added successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "object",
                      properties: {
                        newUrl: {
                          type: "object",
                          properties: {
                            id: { type: "number" },
                            competitor_id: { type: "number" },
                            url: { type: "string" },
                            domain_hash: { type: "string" },
                            created_at: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "409": {
            description: "URL already exists",
          },
        },
      },
      delete: {
        summary: "Remove URL from competitor",
        tags: ["Competitors"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
          {
            name: "url",
            in: "query",
            required: true,
            schema: {
              type: "string",
              format: "uri",
            },
          },
        ],
        responses: {
          "200": {
            description: "URL removed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "object",
                      properties: {
                        removedUrl: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/competitors/{id}/subscribe": {
      post: {
        summary: "Subscribe to competitor updates",
        tags: ["Subscriptions"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "Competitor ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email address to receive updates",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Successfully subscribed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        competitor_id: { type: "number" },
                        email: { type: "string" },
                        created_at: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Competitor not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["error"],
                    },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "409": {
            description: "Already subscribed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["error"],
                    },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        summary: "Get all subscribers for a competitor",
        tags: ["Subscriptions"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "Competitor ID",
          },
        ],
        responses: {
          "200": {
            description: "Subscribers retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "number" },
                          competitor_id: { type: "number" },
                          email: { type: "string" },
                          created_at: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Competitor not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["error"],
                    },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: "Unsubscribe from competitor updates",
        tags: ["Subscriptions"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "Competitor ID",
          },
          {
            name: "email",
            in: "query",
            required: true,
            schema: {
              type: "string",
              format: "email",
            },
            description: "Email address to unsubscribe",
          },
        ],
        responses: {
          "200": {
            description: "Successfully unsubscribed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Competitor not found or subscription not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["error"],
                    },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};
