require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl:
      (process.env.DB_SSL ?? 'true').toLowerCase() !== 'false'
        ? { rejectUnauthorized: false }
        : false,
  });
  await c.connect();
  await c.query(`
    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS reminder_email_sent_at TIMESTAMPTZ NULL;

    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS project VARCHAR(80) NULL;

    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;

    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS checklist JSONB NOT NULL DEFAULT '[]'::jsonb;

    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS recurrence VARCHAR(16) NOT NULL DEFAULT 'none';
  `);
  console.log('OK: columnas de tasks verificadas/creadas.');
  await c.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
