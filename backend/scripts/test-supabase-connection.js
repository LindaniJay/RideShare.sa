#!/usr/bin/env node
/**
 * Test Supabase Connection
 * This script tests different connection string formats to find the correct one
 */

const { Client } = require('pg');
require('dotenv').config();

const password = '0692151207@Lj';
const encodedPassword = encodeURIComponent(password);
const projectRef = 'jmntfhcjvxlyxlyipgvk';

const connectionStrings = [
  // Direct connection format
  `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`,
  
  // Pooler format (common regions)
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  
  // Session mode pooler (port 6543)
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
];

async function testConnection(connectionString, label) {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log(`✅ ${label}: SUCCESS`);
    console.log(`   Connection: ${connectionString.split('@')[1]}`);
    
    // Test query
    const result = await client.query('SELECT NOW(), current_database()');
    console.log(`   Database: ${result.rows[0].current_database}`);
    console.log(`   Time: ${result.rows[0].now}`);
    
    await client.end();
    return true;
  } catch (error) {
    console.log(`❌ ${label}: FAILED`);
    console.log(`   Error: ${error.message.substring(0, 80)}...`);
    return false;
  }
}

async function testAllConnections() {
  console.log('🔍 Testing Supabase Connection Strings...\n');
  console.log('Password:', password);
  console.log('Encoded:', encodedPassword);
  console.log('Project:', projectRef);
  console.log('\n' + '='.repeat(60) + '\n');

  let success = false;

  for (let i = 0; i < connectionStrings.length; i++) {
    const label = `Format ${i + 1}`;
    const success = await testConnection(connectionStrings[i], label);
    if (success) {
      console.log(`\n🎉 Found working connection string!`);
      console.log(`\nAdd this to your .env file:`);
      console.log(`DATABASE_URL=${connectionStrings[i]}\n`);
      return;
    }
    console.log('');
  }

  if (!success) {
    console.log('\n❌ None of the connection strings worked.');
    console.log('\n💡 Next steps:');
    console.log('   1. Go to: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/database');
    console.log('   2. Find the "Connection string" or "Database URL"');
    console.log('   3. Copy it exactly as shown');
    console.log('   4. Update your .env file');
  }
}

testAllConnections();


















