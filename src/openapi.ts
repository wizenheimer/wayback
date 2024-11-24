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
      url: "https://wayback.xnayankumar.workers.dev",
      description: "Production server",
    },
  ],
  paths: {
    "/v1/api/screenshot": {
      post: {
        summary: "Take a screenshot of a webpage",
        tags: ["Screenshot"],
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
                    description: "URL of the webpage to screenshot",
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
                      },
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
    "/v1/api/screenshot/{hash}/{date}": {
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
            name: "date",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^\\d{8}$",
            },
            description: "Date in DDMMYYYY format",
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
        },
      },
    },
    "/v1/api/content/{hash}/{date}": {
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
            name: "date",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^\\d{8}$",
            },
            description: "Date in DDMMYYYY format",
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
        },
      },
    },
    "/v1/api/diff/create": {
      post: {
        summary: "Generate diff between two versions",
        tags: ["Diff"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["url", "timestamp1", "timestamp2"],
                properties: {
                  url: {
                    type: "string",
                    format: "uri",
                  },
                  timestamp1: {
                    type: "string",
                    pattern: "^\\d{8}$",
                  },
                  timestamp2: {
                    type: "string",
                    pattern: "^\\d{8}$",
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
    "/v1/api/diff/history": {
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
            name: "from",
            in: "query",
            schema: {
              type: "string",
              pattern: "^\\d{8}$",
            },
          },
          {
            name: "to",
            in: "query",
            schema: {
              type: "string",
              pattern: "^\\d{8}$",
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
