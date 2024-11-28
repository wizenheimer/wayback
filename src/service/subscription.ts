import { Subscription } from "../types";

// src/service/subscription.ts
export class SubscriptionService {
  constructor(private db: D1Database) {}

  async ensureTable(): Promise<void> {
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

  async subscribe(competitorId: number, email: string): Promise<Subscription> {
    await this.ensureTable();

    const subscription = await this.db
      .prepare(
        `
        INSERT INTO subscriptions (competitor_id, email)
        VALUES (?, ?)
        RETURNING *
      `
      )
      .bind(competitorId, email)
      .first<Subscription>();

    if (!subscription) {
      throw new Error("Failed to create subscription");
    }

    return subscription;
  }

  async unsubscribe(competitorId: number, email: string): Promise<void> {
    await this.db
      .prepare(
        `
        UPDATE subscriptions
        SET status = 'unsubscribed'
        WHERE competitor_id = ? AND email = ?
      `
      )
      .bind(competitorId, email)
      .run();
  }

  async getSubscribersByCompetitor(competitorId: number): Promise<string[]> {
    const result = await this.db
      .prepare(
        `
        SELECT email
        FROM subscriptions
        WHERE competitor_id = ? AND status = 'active'
      `
      )
      .bind(competitorId)
      .all<{ email: string }>();

    return result.results.map((r) => r.email);
  }

  async getSubscribersByCompetitors(
    competitorIds: number[]
  ): Promise<Record<number, string[]>> {
    const placeholders = competitorIds.map(() => "?").join(",");
    const result = await this.db
      .prepare(
        `
        SELECT competitor_id, email
        FROM subscriptions
        WHERE competitor_id IN (${placeholders}) AND status = 'active'
      `
      )
      .bind(...competitorIds)
      .all<{ competitor_id: number; email: string }>();

    return result.results.reduce((acc, { competitor_id, email }) => {
      if (!acc[competitor_id]) acc[competitor_id] = [];
      acc[competitor_id].push(email);
      return acc;
    }, {} as Record<number, string[]>);
  }
}
