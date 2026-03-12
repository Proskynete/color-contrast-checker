/**
 * Run all pending migrations against the Neon database.
 * Usage: DATABASE_URL=... npx tsx src/db/migrate.ts
 */
import { readdirSync,readFileSync } from 'node:fs';
import { join } from 'node:path';

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const migrationsDir = join(import.meta.dirname, 'migrations');
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

console.log(`Running ${files.length} migration(s)...\n`);

for (const file of files) {
  const filePath = join(migrationsDir, file);
  const query = readFileSync(filePath, 'utf-8');
  try {
    await sql.query(query);
    console.log(`✓ ${file}`);
  } catch (err) {
    console.error(`✗ ${file}:`, err);
    process.exit(1);
  }
}

console.log('\nMigrations complete.');
