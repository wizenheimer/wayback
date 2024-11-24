const ensureDiffTable = async (db: D1Database) => {
  await db
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
};
