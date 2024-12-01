import { Hono } from "hono";
import { Bindings } from "../types/core";
import {
  createCompetitorEndpoint,
  deleteCompetitorEndpoint,
  getCompetitorEndpoint,
  listCompetitorsbyHash,
  listCompetitorsEndpoint,
  listCompetitorsURLs,
  updateCompetitorEndpoint,
  updateCompetitorURLEndpoint,
} from "../constants";
import { zValidator } from "@hono/zod-validator";
import {
  AddUrlInput,
  addUrlSchema,
  competitorSchema,
  updateCompetitorSchema,
} from "../schema";
import { initializeServices } from "../utils/initializer";
import { log } from "../utils/log";
// ===============================================================
//                  Competitor Management - Aggregate
//
//                            Creation and Listing
// ===============================================================

const competitorServiceRouter = new Hono<{ Bindings: Bindings }>();

// List all competitors with pagination
competitorServiceRouter.get(listCompetitorsEndpoint, async (c) => {
  try {
    const { competitorService } = initializeServices(c);
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");

    const result = await competitorService.listCompetitors({ limit, offset });

    return c.json({
      status: "success",
      data: result.competitors,
      metadata: {
        total: result.total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("List competitors error:", error);
    return c.json(
      {
        status: "error",
        error:
          error instanceof Error ? error.message : "Failed to list competitors",
      },
      500
    );
  }
});

// List competitor URLs with pagination and optional domain hash filter
competitorServiceRouter.get(listCompetitorsURLs, async (c) => {
  try {
    const { competitorService } = initializeServices(c);
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");
    const domainHash = c.req.query("domain_hash");

    const result = await competitorService.listCompetitorUrls({
      limit,
      offset,
      domainHash,
    });

    return c.json({
      status: "success",
      data: result.urls,
      metadata: {
        total: result.total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("List competitor URLs error:", error);
    return c.json(
      {
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Failed to list competitor URLs",
      },
      500
    );
  }
});

// Create a new competitor
competitorServiceRouter.post(
  createCompetitorEndpoint,
  zValidator("json", competitorSchema),
  async (c) => {
    try {
      const input = await c.req.json();
      const { competitorService } = initializeServices(c);

      const result = await competitorService.createCompetitor(input);

      return c.json({
        status: "success",
        data: result,
      });
    } catch (error) {
      console.error("Create competitor error:", error);
      return c.json(
        {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to create competitor",
        },
        500
      );
    }
  }
);

// Find competitors by URL domain hash
competitorServiceRouter.get(listCompetitorsbyHash, async (c) => {
  try {
    const domainHash = c.req.param("hash");
    const { competitorService } = initializeServices(c);

    const result = await competitorService.findCompetitorsByUrlHash(domainHash);

    return c.json({
      status: "success",
      data: result,
      metadata: {
        count: result.length,
      },
    });
  } catch (error) {
    console.error("Find competitors by domain hash error:", error);
    return c.json(
      {
        status: "error",
        error:
          error instanceof Error ? error.message : "Failed to find competitors",
      },
      500
    );
  }
});

// =======================================================================
//                  Competitor Management - Individual
//
//         Get Any, Update Any, Add URL, Remove URL, Delete Competitor
// =======================================================================

// Find competitor by ID
competitorServiceRouter.get(getCompetitorEndpoint, async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    log("Getting competitor by ID:", id);

    const { competitorService } = initializeServices(c);
    log("Competitor service initialized");

    const result = await competitorService.getCompetitor(id);
    log("Got competitor lookup result:", result);

    if (!result) {
      return c.json(
        {
          status: "error",
          error: "Competitor not found",
        },
        404
      );
    }
    log("Returning competitor data");

    return c.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("Get competitor error:", error);
    return c.json(
      {
        status: "error",
        error:
          error instanceof Error ? error.message : "Failed to get competitor",
      },
      500
    );
  }
});

// Register a new URL for a competitor
competitorServiceRouter.post(
  updateCompetitorURLEndpoint,
  zValidator("json", addUrlSchema),
  async (c) => {
    log("Adding URL to competitor");
    try {
      const competitorId = parseInt(c.req.param("id"));
      const { url } = await c.req.json<AddUrlInput>();
      log("Competitor ID and URL:", competitorId, url);

      const { competitorService } = initializeServices(c);

      // Add URL
      const newUrl = await competitorService.addUrl(competitorId, url);
      log(
        "Added URL:",
        newUrl,
        "to competitor ID:",
        competitorId,
        "successfully"
      );

      return c.json({
        status: "success",
        data: {
          newUrl,
        },
      });
    } catch (error) {
      console.error("Add URL error:", error);

      if (error instanceof Error) {
        if (error.message === "URL already exists for this competitor") {
          return c.json(
            {
              status: "error",
              error: error.message,
            },
            409
          ); // Conflict
        }
        if (error.message === "Competitor not found") {
          return c.json(
            {
              status: "error",
              error: error.message,
            },
            404
          );
        }
      }

      return c.json(
        {
          status: "error",
          error: error instanceof Error ? error.message : "Failed to add URL",
        },
        500
      );
    }
  }
);

// Remove a URL from a competitor
competitorServiceRouter.delete(updateCompetitorURLEndpoint, async (c) => {
  try {
    const competitorId = parseInt(c.req.param("id"));
    const url = c.req.query("url");
    log("Removing URL from competitor:", competitorId, url);

    if (!url) {
      return c.json(
        {
          status: "error",
          error: "URL parameter is required",
        },
        400
      );
    }

    const { competitorService } = initializeServices(c);

    // Remove URL
    await competitorService.removeUrl(competitorId, url);
    log("Removed URL:", url, "from competitor ID:", competitorId);

    return c.json({
      status: "success",
      data: {
        removedUrl: url,
      },
    });
  } catch (error) {
    console.error("Remove URL error:", error);

    if (error instanceof Error) {
      if (error.message === "URL not found for this competitor") {
        return c.json(
          {
            status: "error",
            error: error.message,
          },
          404
        );
      }
      if (error.message === "Competitor not found") {
        return c.json(
          {
            status: "error",
            error: error.message,
          },
          404
        );
      }
    }

    return c.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Failed to remove URL",
      },
      500
    );
  }
});

// Update any property of a competitor
competitorServiceRouter.put(
  updateCompetitorEndpoint,
  zValidator("json", updateCompetitorSchema),
  async (c) => {
    try {
      const id = parseInt(c.req.param("id"));
      const input = await c.req.json();
      log("Updating competitor ID:", id, "with data:", input);

      const { competitorService } = initializeServices(c);

      const result = await competitorService.updateCompetitor(id, input);
      log("Updated competitor data:", result, "id:", id, "input:", input);

      return c.json({
        status: "success",
        data: result,
      });
    } catch (error) {
      console.error("Update competitor error:", error);
      return c.json(
        {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to update competitor",
        },
        500
      );
    }
  }
);

// Delete entire competitor info including URLs
competitorServiceRouter.delete(deleteCompetitorEndpoint, async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    log("Deleting competitor ID:", id);

    const { competitorService } = initializeServices(c);

    await competitorService.deleteCompetitor(id);
    log("Deleted competitor ID:", id);

    return c.json({
      status: "success",
      message: "Competitor deleted successfully",
    });
  } catch (error) {
    console.error("Delete competitor error:", error);
    return c.json(
      {
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete competitor",
      },
      500
    );
  }
});

export default competitorServiceRouter;
