#!/usr/bin/env ts-node
/**
 * Setup Supabase Database Tables
 * 
 * This script creates all required tables in Supabase database using Sequelize models.
 * Run: npm run setup:supabase or npx ts-node scripts/setup-supabase-tables.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import { sequelize } from '../src/config/database';
import { logger } from '../src/utils/logger';
import * as models from '../src/models';

async function setupSupabaseTables() {
  try {
    logger.info('🚀 Starting Supabase database setup...');
    
    // Test connection first
    logger.info('📡 Testing database connection...');
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
    
    // Log database info
    const dbName = sequelize.getDatabaseName();
    const dbHost = sequelize.config.host;
    logger.info(`📊 Database: ${dbName} @ ${dbHost}`);
    
    // Import all models to ensure they're registered
    logger.info('📦 Loading models...');
    const modelNames = Object.keys(models).filter(key => 
      typeof models[key as keyof typeof models] !== 'function' ||
      models[key as keyof typeof models].name === 'Model' ||
      models[key as keyof typeof models].constructor.name === 'Model'
    );
    logger.info(`✅ Loaded ${modelNames.length} models`);
    
    // Sync models - alter: true will add/update tables without dropping data
    logger.info('🔄 Synchronizing database schema...');
    logger.info('⚠️  This will create/update tables. Existing data will be preserved.');
    
    await sequelize.sync({ alter: true });
    
    logger.info('✅ Database schema synchronized successfully');
    logger.info('');
    logger.info('📋 Created/Updated Tables:');
    
    // List all tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    tables.forEach((table: any) => {
      logger.info(`  ✓ ${table.table_name}`);
    });
    
    logger.info('');
    logger.info('🎉 Supabase database setup completed successfully!');
    logger.info('');
    logger.info('💡 Next steps:');
    logger.info('   1. Verify tables in Supabase Dashboard');
    logger.info('   2. Set up Row Level Security (RLS) policies if needed');
    logger.info('   3. Run seed scripts if you have initial data');
    
  } catch (error: any) {
    logger.error('❌ Error setting up Supabase tables:', error);
    logger.error('Error details:', error.message);
    if (error.stack) {
      logger.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
    logger.info('🔌 Database connection closed');
  }
}

// Run setup
setupSupabaseTables();


















