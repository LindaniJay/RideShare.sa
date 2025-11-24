#!/usr/bin/env node
/**
 * Comprehensive Supabase Connection Test
 * Tests both REST API (Supabase client) and direct PostgreSQL connections
 */

const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jmntfhcjvxlyxlyipgvk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbnRmaGNqdnhseXhseWlwZ3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNjcxMzUsImV4cCI6MjA3Nzc0MzEzNX0.v0Qi0rGEqyx3JpAq5UYXPoDELLk-kSQyCLSEO1NKWwM';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbnRmaGNqdnhseXhseWlwZ3ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE2NzEzNSwiZXhwIjoyMDc3NzQzMTM1fQ.4Yb9QYYqMcZwsJZ80abpm_suVAjIVNvosjeItWDRaU0';
const password = process.env.SUPABASE_DB_PASSWORD || '0692151207@Lj';
const encodedPassword = encodeURIComponent(password);
const projectRef = 'jmntfhcjvxlyxlyipgvk';

console.log('🔍 Comprehensive Supabase Connection Test\n');
console.log('='.repeat(70));
console.log(`Project: ${projectRef}`);
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log('='.repeat(70) + '\n');

// Test 1: Supabase REST API (Anon Key)
async function testSupabaseClient() {
  console.log('📡 Test 1: Supabase REST API (Anon Key)');
  console.log('-'.repeat(70));
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test with a simple query that should work even on empty database
    const { data, error, status } = await supabase
      .from('_prisma_migrations')
      .select('id')
      .limit(1);
    
    if (error) {
      // If table doesn't exist, that's OK - it means the connection works
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('✅ Connection successful! (Table does not exist yet, which is expected)');
        console.log(`   Status: ${status}`);
        return true;
      }
      console.log(`❌ Connection failed: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Status: ${status}`);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log(`   Status: ${status}`);
    if (data) {
      console.log(`   Data returned: ${data.length} rows`);
    }
    return true;
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    return false;
  }
}

// Test 2: Supabase REST API (Service Role Key)
async function testSupabaseAdminClient() {
  console.log('\n📡 Test 2: Supabase REST API (Service Role Key)');
  console.log('-'.repeat(70));
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data, error, status } = await supabase
      .from('_prisma_migrations')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('✅ Connection successful! (Table does not exist yet, which is expected)');
        console.log(`   Status: ${status}`);
        return true;
      }
      console.log(`❌ Connection failed: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log(`   Status: ${status}`);
    return true;
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    return false;
  }
}

// Test 3: Direct PostgreSQL Connection (various formats)
async function testDirectPostgreSQL() {
  console.log('\n🗄️  Test 3: Direct PostgreSQL Connection');
  console.log('-'.repeat(70));
  
  // Extract project ref from URL
  const urlMatch = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
  const extractedRef = urlMatch ? urlMatch[1] : projectRef;
  
  console.log(`Using project ref: ${extractedRef}\n`);
  
  const connectionStrings = [
    {
      label: 'Direct connection (port 5432)',
      url: `postgresql://postgres:${encodedPassword}@db.${extractedRef}.supabase.co:5432/postgres`
    },
    {
      label: 'Pooler - Transaction mode (port 5432) - sa-east-1',
      url: `postgresql://postgres.${extractedRef}:${encodedPassword}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`
    },
    {
      label: 'Pooler - Transaction mode (port 5432) - us-east-1',
      url: `postgresql://postgres.${extractedRef}:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
    },
    {
      label: 'Pooler - Transaction mode (port 5432) - eu-west-1',
      url: `postgresql://postgres.${extractedRef}:${encodedPassword}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`
    },
    {
      label: 'Pooler - Session mode (port 6543) - sa-east-1',
      url: `postgresql://postgres.${extractedRef}:${encodedPassword}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`
    },
    {
      label: 'Pooler - Session mode (port 6543) - us-east-1',
      url: `postgresql://postgres.${extractedRef}:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
    },
    {
      label: 'Pooler - Session mode (port 6543) - eu-west-1',
      url: `postgresql://postgres.${extractedRef}:${encodedPassword}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`
    },
  ];
  
  for (const { label, url } of connectionStrings) {
    console.log(`Testing: ${label}`);
    const client = new Client({
      connectionString: url,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000
    });
    
    try {
      await client.connect();
      const result = await client.query('SELECT NOW(), current_database(), version()');
      console.log(`  ✅ SUCCESS`);
      console.log(`     Database: ${result.rows[0].current_database}`);
      console.log(`     Time: ${result.rows[0].now}`);
      console.log(`     PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
      console.log(`\n  💡 Use this connection string in your .env:`);
      console.log(`     DATABASE_URL=${url}\n`);
      await client.end();
      return { success: true, url };
    } catch (error) {
      const errorMsg = error.message.substring(0, 100);
      console.log(`  ❌ FAILED: ${errorMsg}`);
      if (error.code) {
        console.log(`     Error code: ${error.code}`);
      }
    }
    console.log('');
  }
  
  return { success: false, url: null };
}

// Test 4: Check project status via REST API
async function testProjectStatus() {
  console.log('\n📊 Test 4: Project Status Check');
  console.log('-'.repeat(70));
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Try to get project info by querying a system table
    const { data, error } = await supabase.rpc('version');
    
    if (!error) {
      console.log('✅ Project is active and responding');
      return true;
    }
    
    // Try a different approach - check if we can list tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (!tablesError) {
      console.log('✅ Project is active and responding');
      return true;
    }
    
    // If we get here, the REST API works but might not have tables
    console.log('⚠️  Project responds but may not be fully provisioned');
    console.log(`   Error: ${error?.message || tablesError?.message}`);
    return false;
  } catch (error) {
    console.log(`❌ Could not check project status: ${error.message}`);
    return false;
  }
}

// Main test function
async function runAllTests() {
  const results = {
    restApi: false,
    adminApi: false,
    postgres: false,
    projectStatus: false
  };
  
  results.restApi = await testSupabaseClient();
  results.adminApi = await testSupabaseAdminClient();
  results.projectStatus = await testProjectStatus();
  const pgResult = await testDirectPostgreSQL();
  results.postgres = pgResult.success;
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📋 Test Summary');
  console.log('='.repeat(70));
  console.log(`REST API (Anon Key):     ${results.restApi ? '✅' : '❌'}`);
  console.log(`REST API (Service Role): ${results.adminApi ? '✅' : '❌'}`);
  console.log(`Project Status:         ${results.projectStatus ? '✅' : '❌'}`);
  console.log(`Direct PostgreSQL:      ${results.postgres ? '✅' : '❌'}`);
  console.log('='.repeat(70));
  
  if (results.postgres && pgResult.url) {
    console.log('\n🎉 Found working PostgreSQL connection!');
    console.log('\n📝 Add this to your .env file:');
    console.log(`DATABASE_URL=${pgResult.url}`);
  } else if (results.restApi || results.adminApi) {
    console.log('\n💡 Supabase REST API is working!');
    console.log('   You can use Supabase client for database operations.');
    console.log('   For direct PostgreSQL access, check your Supabase dashboard:');
    console.log('   https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/database');
  } else {
    console.log('\n❌ No connections are working.');
    console.log('\n💡 Next steps:');
    console.log('   1. Verify your project is active: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk');
    console.log('   2. Check your credentials in .env file');
    console.log('   3. Get connection string from: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/database');
  }
}

// Run tests
runAllTests().catch(console.error);










