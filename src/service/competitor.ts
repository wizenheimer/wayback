// src/service/competitor.ts
import {
  Competitor,
  CompetitorUrl,
  CompetitorWithUrls,
} from "../types/competitor";
import { generatePathHash } from "../utils/path";
import { CreateCompetitorInput, UpdateCompetitorInput } from "../schema";

export class CompetitorService {
  constructor(private db: D1Database) {}

  private getDomainHash(url: string): string {
    const domain = new URL(url).origin;
    return generatePathHash(domain);
  }

  async ensureTables(): Promise<void> {
    // Create competitors table with auto-incrementing ID
    await this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS competitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
      )
      .run();

    // Create competitor_urls table with domain_hash
    await this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS competitor_urls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        competitor_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        domain_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (competitor_id) REFERENCES competitors (id) ON DELETE CASCADE,
        UNIQUE (competitor_id, url)
      )
    `
      )
      .run();

    // Add index on domain_hash for efficient lookups
    await this.db
      .prepare(
        `
      CREATE INDEX IF NOT EXISTS idx_competitor_urls_domain_hash
      ON competitor_urls (domain_hash)
    `
      )
      .run();

    // Add subscription table with competitor_id and email
    await this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        competitor_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        status TEXT CHECK(status IN ('active', 'unsubscribed')) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (competitor_id) REFERENCES competitors (id) ON DELETE CASCADE,
        UNIQUE (competitor_id, email)
      )
    `
      )
      .run();
  }

  async createCompetitor(
    input: CreateCompetitorInput
  ): Promise<CompetitorWithUrls> {
    await this.ensureTables();
    const now = new Date().toISOString();

    // Create the stored procedure
    const createCompetitorProcedure = async (db: D1Database) => {
      const competitor = await db
        .prepare(
          `
      INSERT INTO competitors (domain, name, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `
        )
        .bind(input.domain, input.name, now, now)
        .first<Competitor>();

      if (!competitor) {
        throw new Error("Failed to create competitor");
      }

      const statements: D1PreparedStatement[] = [];

      // Insert URLs
      for (const url of input.urls) {
        const domainHash = this.getDomainHash(url);
        const statement = db
          .prepare(
            `
        INSERT INTO competitor_urls (competitor_id, url, domain_hash, created_at)
        VALUES (?, ?, ?, ?)
      `
          )
          .bind(competitor.id, url, domainHash, now);
        statements.push(statement);
      }

      return {
        competitor,
        statements,
      };
    };

    // Execute the stored procedure
    const { competitor, statements } = await createCompetitorProcedure(this.db);
    await this.db.batch(statements);

    return {
      ...competitor,
      urls: input.urls,
    };
  }

  async updateCompetitor(
    id: number,
    input: UpdateCompetitorInput
  ): Promise<CompetitorWithUrls> {
    await this.ensureTables();

    const statements: D1PreparedStatement[] = [];
    const now = new Date().toISOString();

    // Prepare competitor update statement
    const updates: string[] = [];
    const bindings: any[] = [];

    if (input.name !== undefined) {
      updates.push("name = ?");
      bindings.push(input.name);
    }

    if (input.domain !== undefined) {
      updates.push("domain = ?");
      bindings.push(input.domain);
    }

    updates.push("updated_at = ?");
    bindings.push(now);
    bindings.push(id);

    const competitor = await this.db
      .prepare(
        `
      UPDATE competitors
      SET ${updates.join(", ")}
      WHERE id = ?
      RETURNING *
    `
      )
      .bind(...bindings)
      .first<Competitor>();

    if (!competitor) {
      throw new Error("Competitor not found");
    }

    if (input.urls) {
      // Add delete statement
      statements.push(
        this.db
          .prepare(
            `
          DELETE FROM competitor_urls
          WHERE competitor_id = ?
        `
          )
          .bind(id)
      );

      // Add insert statements for new URLs
      input.urls.forEach((url) => {
        const domainHash = this.getDomainHash(url);
        statements.push(
          this.db
            .prepare(
              `
            INSERT INTO competitor_urls (competitor_id, url, domain_hash, created_at)
            VALUES (?, ?, ?, ?)
          `
            )
            .bind(id, url, domainHash, now)
        );
      });

      // Execute all URL updates in a batch
      await this.db.batch(statements);
    }

    // Get updated URLs
    const urlsResult = await this.db
      .prepare(
        `
      SELECT * FROM competitor_urls
      WHERE competitor_id = ?
      ORDER BY created_at ASC
    `
      )
      .bind(id)
      .all<CompetitorUrl>();

    return {
      ...competitor,
      urls: urlsResult.results.map((u) => u.url),
    };
  }

  async findCompetitorsByUrlHash(
    domainHash: string
  ): Promise<CompetitorWithUrls[]> {
    await this.ensureTables();

    const competitors = await this.db
      .prepare(
        `
      SELECT DISTINCT c.*
      FROM competitors c
      JOIN competitor_urls cu ON c.id = cu.competitor_id
      WHERE cu.domain_hash = ?
      ORDER BY c.created_at DESC
    `
      )
      .bind(domainHash)
      .all<Competitor>();

    return Promise.all(
      competitors.results.map(async (competitor) => {
        const urls = await this.getCompetitorUrls(competitor.id);
        return {
          ...competitor,
          urls: urls.map((u) => u.url),
        };
      })
    );
  }

  private async getCompetitorUrls(id: number): Promise<CompetitorUrl[]> {
    const result = await this.db
      .prepare(
        `
      SELECT * FROM competitor_urls
      WHERE competitor_id = ?
      ORDER BY created_at ASC
    `
      )
      .bind(id)
      .all<CompetitorUrl>();

    return result.results;
  }

  async getCompetitor(id: number): Promise<CompetitorWithUrls | null> {
    await this.ensureTables();

    const competitor = await this.db
      .prepare(
        `
      SELECT * FROM competitors
      WHERE id = ?
    `
      )
      .bind(id)
      .first<Competitor>();

    if (!competitor) {
      return null;
    }

    const urls = await this.getCompetitorUrls(competitor.id);

    return {
      ...competitor,
      urls: urls.map((u) => u.url),
    };
  }

  async listCompetitors(
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ competitors: CompetitorWithUrls[]; total: number }> {
    await this.ensureTables();

    const { limit = 10, offset = 0 } = options;

    const [competitorsResult, totalResult] = await Promise.all([
      this.db
        .prepare(
          `
        SELECT * FROM competitors
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `
        )
        .bind(limit, offset)
        .all<Competitor>(),
      this.db
        .prepare(
          `
        SELECT COUNT(*) as count FROM competitors
      `
        )
        .first<{ count: number }>(),
    ]);

    const competitors = await Promise.all(
      competitorsResult.results.map(async (competitor) => {
        const urls = await this.getCompetitorUrls(competitor.id);
        return {
          ...competitor,
          urls: urls.map((u) => u.url),
        };
      })
    );

    return {
      competitors,
      total: totalResult?.count || 0,
    };
  }

  async listCompetitorUrls(
    options: {
      limit?: number;
      offset?: number;
      domainHash?: string;
    } = {}
  ): Promise<{
    urls: (CompetitorUrl & {
      competitor_name: string;
      competitor_domain: string;
    })[];
    total: number;
  }> {
    await this.ensureTables();

    const { limit = 10, offset = 0, domainHash } = options;

    let query = `
      SELECT cu.*, c.name as competitor_name, c.domain as competitor_domain
      FROM competitor_urls cu
      JOIN competitors c ON cu.competitor_id = c.id
    `;

    const bindings: any[] = [];

    if (domainHash) {
      query += ` WHERE cu.domain_hash = ?`;
      bindings.push(domainHash);
    }

    query += ` ORDER BY cu.created_at DESC LIMIT ? OFFSET ?`;
    bindings.push(limit, offset);

    const [urls, totalResult] = await Promise.all([
      this.db
        .prepare(query)
        .bind(...bindings)
        .all<
          CompetitorUrl & {
            competitor_name: string;
            competitor_domain: string;
          }
        >(),
      this.db
        .prepare(
          `
        SELECT COUNT(*) as count
        FROM competitor_urls
        ${domainHash ? "WHERE domain_hash = ?" : ""}
      `
        )
        .bind(...(domainHash ? [domainHash] : []))
        .first<{ count: number }>(),
    ]);

    return {
      urls: urls.results,
      total: totalResult?.count || 0,
    };
  }

  async addUrl(competitorId: number, url: string): Promise<CompetitorUrl> {
    await this.ensureTables();

    // Check if competitor exists
    const competitor = await this.db
      .prepare(
        `
      SELECT * FROM competitors WHERE id = ?
    `
      )
      .bind(competitorId)
      .first<Competitor>();

    if (!competitor) {
      throw new Error("Competitor not found");
    }

    // Check if URL already exists
    const existingUrl = await this.db
      .prepare(
        `
      SELECT * FROM competitor_urls
      WHERE competitor_id = ? AND url = ?
    `
      )
      .bind(competitorId, url)
      .first<CompetitorUrl>();

    if (existingUrl) {
      throw new Error("URL already exists for this competitor");
    }

    // Add new URL
    const domainHash = this.getDomainHash(url);
    const now = new Date().toISOString();

    const newUrl = await this.db
      .prepare(
        `
      INSERT INTO competitor_urls (competitor_id, url, domain_hash, created_at)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `
      )
      .bind(competitorId, url, domainHash, now)
      .first<CompetitorUrl>();

    if (!newUrl) {
      throw new Error("Failed to add URL");
    }

    return newUrl;
  }

  async removeUrl(competitorId: number, url: string): Promise<void> {
    await this.ensureTables();

    // Check if competitor exists
    const competitor = await this.db
      .prepare(
        `
      SELECT * FROM competitors WHERE id = ?
    `
      )
      .bind(competitorId)
      .first<Competitor>();

    if (!competitor) {
      throw new Error("Competitor not found");
    }

    // Delete URL if it exists
    const result = await this.db
      .prepare(
        `
      DELETE FROM competitor_urls
      WHERE competitor_id = ? AND url = ?
      RETURNING id
    `
      )
      .bind(competitorId, url)
      .first<{ id: number }>();

    if (!result) {
      throw new Error("URL not found for this competitor");
    }
  }

  // Read-only methods
  async getUrlCount(competitorId: number): Promise<number> {
    const result = await this.db
      .prepare(
        `
      SELECT COUNT(*) as count
      FROM competitor_urls
      WHERE competitor_id = ?
    `
      )
      .bind(competitorId)
      .first<{ count: number }>();

    return result?.count || 0;
  }

  // Update existing deleteCompetitor method to use RETURNING as well
  async deleteCompetitor(id: number): Promise<void> {
    await this.ensureTables();

    const result = await this.db
      .prepare(
        `
      DELETE FROM competitors
      WHERE id = ?
      RETURNING id
    `
      )
      .bind(id)
      .first<{ id: number }>();

    if (!result) {
      throw new Error("Competitor not found");
    }
  }
}
