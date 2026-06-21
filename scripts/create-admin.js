/**
 * Create default admin user in Supabase Auth.
 * Run: npm run create:admin
 */
require('dotenv').config();
const { Client } = require('pg');

const email = process.env.ADMIN_EMAIL || 'labadmin@foorganics.pk';
const password = process.env.ADMIN_PASSWORD || 'Admin@123';
const PROJECT_REF = 'wdjcwmypxzkxjxmznhlr';
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!dbPassword) {
  console.error('Missing SUPABASE_DB_PASSWORD in .env');
  process.exit(1);
}

const connectionString = process.env.SUPABASE_DB_URL ||
  `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(dbPassword)}@aws-1-ap-south-1.pooler.supabase.com:6543/postgres`;

const sql = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$
DECLARE user_id uuid := gen_random_uuid();
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = '${email}') THEN
    RAISE NOTICE 'User already exists: ${email}';
    RETURN;
  END IF;
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, recovery_sent_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated',
    '${email}', crypt('${password}', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{"role":"admin"}',
    NOW(), NOW(), '', '', '', ''
  );
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), user_id,
    jsonb_build_object('sub', user_id::text, 'email', '${email}'),
    'email', user_id::text, NOW(), NOW(), NOW()
  );
END $$;
`;

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('Admin user ready:');
  console.log('  Email:', email);
  console.log('  Password:', password);
  console.log('  Login at: http://localhost:3000/labadmin');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
