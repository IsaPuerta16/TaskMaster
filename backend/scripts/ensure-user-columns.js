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
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL;

    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_reset_token TEXT NULL;

    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ NULL;
  `);
  console.log('OK: columnas users (avatar, reset password) verificadas/creadas.');
  await c.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
