// src/service/db.ts

import { DiffAnalysis } from "../types";

export class DBService {
  constructor(private db: D1Database) {}

  async ensureDiffTable(): Promise<void> {
    await this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS content_diffs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        timestamp1 TEXT NOT NULL,
        timestamp2 TEXT NOT NULL,
        branding_changes TEXT NOT NULL,
        integration_changes TEXT NOT NULL,
        pricing_changes TEXT NOT NULL,
        product_changes TEXT NOT NULL,
        positioning_changes TEXT NOT NULL,
        partnership_changes TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
      )
      .run();
  }

  async insertDiff(params: {
    url: string;
    timestamp1: string;
    timestamp2: string;
    differences: DiffAnalysis;
  }): Promise<void> {
    const { url, timestamp1, timestamp2, differences } = params;

    await this.db
      .prepare(
        `
      INSERT INTO content_diffs (
        url, 
        timestamp1, 
        timestamp2, 
        branding_changes,
        integration_changes,
        pricing_changes,
        product_changes,
        positioning_changes,
        partnership_changes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .bind(
        url,
        timestamp1,
        timestamp2,
        JSON.stringify(differences.branding),
        JSON.stringify(differences.integration),
        JSON.stringify(differences.pricing),
        JSON.stringify(differences.product),
        JSON.stringify(differences.positioning),
        JSON.stringify(differences.partnership)
      )
      .run();
  }

  async getDiffHistory(params: {
    url: string;
    from?: string; // Format: DDMMYYYY
    to?: string; // Format: DDMMYYYY
    limit?: number;
  }) {
    const { url, from, to, limit = 10 } = params;

    // Build the query based on provided parameters
    let query = `
      SELECT * FROM content_diffs 
      WHERE url = ?
    `;
    const bindings: any[] = [url];

    if (from && to) {
      query += ` AND (
        (timestamp1 BETWEEN ? AND ?) OR 
        (timestamp2 BETWEEN ? AND ?)
      )`;
      bindings.push(from, to, from, to);
    } else if (from) {
      query += ` AND (timestamp1 >= ? OR timestamp2 >= ?)`;
      bindings.push(from, from);
    } else if (to) {
      query += ` AND (timestamp1 <= ? OR timestamp2 <= ?)`;
      bindings.push(to, to);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    bindings.push(limit);

    const results: any = await this.db
      .prepare(query)
      .bind(...bindings)
      .all();

    return results.results.map((result: any) => ({
      ...result,
      branding_changes: JSON.parse(result.branding_changes),
      integration_changes: JSON.parse(result.integration_changes),
      pricing_changes: JSON.parse(result.pricing_changes),
      product_changes: JSON.parse(result.product_changes),
      positioning_changes: JSON.parse(result.positioning_changes),
      partnership_changes: JSON.parse(result.partnership_changes),
    }));
  }
}
