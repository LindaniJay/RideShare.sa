#!/usr/bin/env node
/**
 * Verify Supabase Project Status
 * Helps diagnose connection issues by checking project status
 */

const https = require('https');
const http = require('http');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jmntfhcjvxlyxlyipgvk.supabase.co';
const projectRef = 'jmntfhcjvxlyxlyipgvk';

console.log('🔍 Supabase Project Verification\n');
console.log('='.repeat(70));
console.log(`Project Reference: ${projectRef}`);
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log('='.repeat(70) + '\n');

// Test 1: Check if the Supabase URL is reachable
async function checkURLReachability() {
  return new Promise((resolve) => {
    console.log('🌐 Test 1: Checking URL Reachability');
    console.log('-'.repeat(70));
    
    const url = new URL(SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': 'test',
        'Accept': 'application/json'
      },
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      console.log(`✅ URL is reachable (Status: ${res.statusCode})`);
      if (res.statusCode === 401) {
        console.log('   Note: 401 is expected - it means the server is responding');
      }
      resolve({ reachable: true, statusCode: res.statusCode });
      res.on('data', () => {});
      res.on('end', () => {});
    });
    
    req.on('error', (error) => {
      console.log(`❌ URL is not reachable: ${error.message}`);
      if (error.code === 'ENOTFOUND') {
        console.log('   This means the domain does not exist or DNS cannot resolve it.');
        console.log('   Possible causes:');
        console.log('   - Project was deleted');
        console.log('   - Project is paused (free tier projects pause after inactivity)');
        console.log('   - Project reference is incorrect');
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
        console.log('   Network connection issue or firewall blocking the connection.');
      }
      resolve({ reachable: false, error: error.message, code: error.code });
    });
    
    req.on('timeout', () => {
      console.log('❌ Connection timeout');
      req.destroy();
      resolve({ reachable: false, error: 'Connection timeout' });
    });
    
    req.end();
  });
}

// Test 2: Check DNS resolution
async function checkDNS() {
  return new Promise((resolve) => {
    console.log('\n🔍 Test 2: DNS Resolution Check');
    console.log('-'.repeat(70));
    
    const dns = require('dns');
    const url = new URL(SUPABASE_URL);
    const hostname = url.hostname;
    
    console.log(`Checking DNS for: ${hostname}`);
    
    dns.resolve4(hostname, (err, addresses) => {
      if (err) {
        console.log(`❌ DNS resolution failed: ${err.message}`);
        console.log('   This means the domain does not exist or cannot be resolved.');
        resolve({ resolved: false, error: err.message });
      } else {
        console.log(`✅ DNS resolved successfully`);
        console.log(`   IP addresses: ${addresses.join(', ')}`);
        resolve({ resolved: true, addresses });
      }
    });
  });
}

// Test 3: Check direct database hostname
async function checkDatabaseHostname() {
  return new Promise((resolve) => {
    console.log('\n🗄️  Test 3: Database Hostname Check');
    console.log('-'.repeat(70));
    
    const dns = require('dns');
    const dbHostname = `db.${projectRef}.supabase.co`;
    
    console.log(`Checking DNS for: ${dbHostname}`);
    
    dns.resolve4(dbHostname, (err, addresses) => {
      if (err) {
        console.log(`❌ DNS resolution failed: ${err.message}`);
        console.log('   This is expected if the project is paused or does not exist.');
        resolve({ resolved: false, error: err.message });
      } else {
        console.log(`✅ DNS resolved successfully`);
        console.log(`   IP addresses: ${addresses.join(', ')}`);
        resolve({ resolved: true, addresses });
      }
    });
  });
}

// Main verification
async function verifyProject() {
  const urlCheck = await checkURLReachability();
  const dnsCheck = await checkDNS();
  const dbCheck = await checkDatabaseHostname();
  
  console.log('\n' + '='.repeat(70));
  console.log('📋 Verification Summary');
  console.log('='.repeat(70));
  console.log(`URL Reachable:        ${urlCheck.reachable ? '✅' : '❌'}`);
  console.log(`DNS Resolution:      ${dnsCheck.resolved ? '✅' : '❌'}`);
  console.log(`Database Hostname:    ${dbCheck.resolved ? '✅' : '❌'}`);
  console.log('='.repeat(70));
  
  if (!urlCheck.reachable || !dnsCheck.resolved) {
    console.log('\n⚠️  Project appears to be unavailable');
    console.log('\n💡 Possible Solutions:');
    console.log('\n1. Check if project is paused:');
    console.log('   - Go to: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk');
    console.log('   - If paused, click "Restore" to reactivate it');
    console.log('   - Free tier projects pause after 7 days of inactivity');
    console.log('\n2. Verify project exists:');
    console.log('   - Go to: https://app.supabase.com/dashboard');
    console.log('   - Check if the project "jmntfhcjvxlyxlyipgvk" is listed');
    console.log('\n3. Check project status:');
    console.log('   - Go to: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/general');
    console.log('   - Verify the project is "Active"');
    console.log('\n4. If project was deleted:');
    console.log('   - You need to create a new project');
    console.log('   - Or restore from backup if available');
    console.log('\n5. Network/Firewall issues:');
    console.log('   - Check if your firewall is blocking connections');
    console.log('   - Try from a different network');
    console.log('   - Check if you\'re behind a corporate proxy');
  } else if (!dbCheck.resolved) {
    console.log('\n⚠️  REST API works but database hostname is not accessible');
    console.log('   This might mean:');
    console.log('   - Project is paused (database hostname is disabled)');
    console.log('   - Direct database connections are not enabled');
    console.log('\n💡 Try using the Supabase REST API instead of direct PostgreSQL');
    console.log('   The Supabase client library should work even if direct DB access is disabled');
  } else {
    console.log('\n✅ Project appears to be active!');
    console.log('   Connection issues might be due to:');
    console.log('   - Incorrect password');
    console.log('   - Wrong connection string format');
    console.log('   - Network/firewall restrictions');
    console.log('\n💡 Next steps:');
    console.log('   1. Get the exact connection string from Supabase dashboard');
    console.log('   2. Go to: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/database');
    console.log('   3. Copy the connection string exactly as shown');
  }
}

verifyProject().catch(console.error);










