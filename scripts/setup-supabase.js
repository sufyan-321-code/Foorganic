const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PROJECT_REF = 'wdjcwmypxzkxjxmznhlr';
const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error('Missing SUPABASE_DB_PASSWORD in .env (use quotes if password contains #)');
  process.exit(1);
}

const connectionString = process.env.SUPABASE_DB_URL ||
  `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-1-ap-south-1.pooler.supabase.com:6543/postgres`;

async function runSqlFile(client, filename) {
  const sql = fs.readFileSync(path.join(__dirname, '../supabase', filename), 'utf8');
  console.log('Running', filename + '...');
  await client.query(sql);
  console.log('  OK', filename);
}

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to Supabase (ap-south-1)');
  try {
    await runSqlFile(client, 'schema.sql');
    await runSqlFile(client, 'seed.sql');
    await runSqlFile(client, 'storage.sql');
    console.log('\nSupabase setup complete!');
  } finally {
    await client.end();
  }
}

main().catch(e => { console.error('Setup failed:', e.message); process.exit(1); });
