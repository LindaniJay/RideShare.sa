#!/usr/bin/env node
/**
 * Script to create backend .env file with proper configuration
 * Run: node create-env.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate strong JWT secrets
const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');

const envContent = `# Environment
NODE_ENV=development
PORT=5001

# Database
DATABASE_URL=sqlite:./database.sqlite

# Firebase Admin SDK
FIREBASE_PROJECT_ID=ride-share-56610
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URLS=http://localhost:3000,http://localhost:5173

# Email Configuration (Optional)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM=noreply@ridesharex.com

# Payment Providers (Optional)
# Stripe (International)
# STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
# STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# PayFast (South Africa)
# PAYFAST_MERCHANT_ID=your_merchant_id
# PAYFAST_MERCHANT_KEY=your_merchant_key
# PAYFAST_PASSPHRASE=your_passphrase
# PAYFAST_SANDBOX=true

# Redis (Optional)
# REDIS_URL=redis://localhost:6379

# File Uploads
UPLOADS_PATH=./uploads
MAX_FILE_SIZE=10485760

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Socket.io
SOCKET_IO_PATH=/socket.io/
`;

const envPath = path.join(__dirname, '.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('Backing up existing .env to .env.backup');
  fs.copyFileSync(envPath, path.join(__dirname, '.env.backup'));
}

// Write .env file
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ Backend .env file created successfully!');
console.log('📍 Location:', envPath);
console.log('');
console.log('🔑 Generated JWT Secrets:');
console.log('   JWT_SECRET:', jwtSecret.substring(0, 20) + '...');
console.log('   JWT_REFRESH_SECRET:', jwtRefreshSecret.substring(0, 20) + '...');
console.log('');
console.log('📝 Next steps:');
console.log('   1. Review the .env file');
console.log('   2. Update DATABASE_URL if needed');
console.log('   3. Add email/payment credentials if required');
console.log('   4. Restart your backend server');


















