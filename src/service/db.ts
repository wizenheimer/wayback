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
        run_id1 TEXT NOT NULL,
        run_id2 TEXT NOT NULL,
        week_number TEXT NOT NULL,
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
    runId1: string;
    runId2: string;
    weekNumber: string;
    differences: DiffAnalysis;
  }): Promise<void> {
    const { url, runId1, runId2, weekNumber, differences } = params;

    await this.db
      .prepare(
        `
      INSERT INTO content_diffs (
        url,
        run_id1,
        run_id2,
        week_number,
        branding_changes,
        integration_changes,
        pricing_changes,
        product_changes,
        positioning_changes,
        partnership_changes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .bind(
        url,
        runId1,
        runId2,
        weekNumber,
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
    fromRunId?: string;
    toRunId?: string;
    weekNumber?: string;
    limit?: number;
  }) {
    const { url, fromRunId, toRunId, weekNumber, limit = 10 } = params;

    // Build the query based on provided parameters
    let query = `
      SELECT * FROM content_diffs
      WHERE url = ?
    `;
    const bindings: any[] = [url];

    if (weekNumber) {
      query += ` AND week_number = ?`;
      bindings.push(weekNumber);
    }

    if (fromRunId && toRunId) {
      query += ` AND (
        (run_id1 BETWEEN ? AND ?) OR
        (run_id2 BETWEEN ? AND ?)
      )`;
      bindings.push(fromRunId, toRunId, fromRunId, toRunId);
    } else if (fromRunId) {
      query += ` AND (run_id1 >= ? OR run_id2 >= ?)`;
      bindings.push(fromRunId, fromRunId);
    } else if (toRunId) {
      query += ` AND (run_id1 <= ? OR run_id2 <= ?)`;
      bindings.push(toRunId, toRunId);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    bindings.push(limit);

    const results = await this.db
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
