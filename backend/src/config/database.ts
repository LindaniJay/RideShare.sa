import { Sequelize } from 'sequelize';
import { env } from './env';
import { logger } from '../utils/logger';
import { getSupabaseConnectionString } from './supabase';

// Database configuration based on environment
const isTest = env.NODE_ENV === 'test';
const isProduction = env.NODE_ENV === 'production';

let sequelize: Sequelize;

if (isTest) {
  // Always use in-memory SQLite for tests
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Use PostgreSQL when DATABASE_URL is provided OR when Supabase credentials are available
  // Try DATABASE_URL first, then fall back to Supabase connection string
  const connectionUrl = env.DATABASE_URL || getSupabaseConnectionString();
  
  if (connectionUrl && (
    connectionUrl.startsWith('postgresql://') || 
    connectionUrl.startsWith('postgres://')
  )) {
    // Supabase uses PostgreSQL, so it works with the same configuration
    const isSupabase = connectionUrl.includes('supabase.co') || connectionUrl.includes('@db.');
    
    sequelize = new Sequelize(connectionUrl, {
      logging: env.NODE_ENV === 'development' ? (sql) => logger.debug(sql) : false,
      define: {
        timestamps: true,
        underscored: true,
      },
      pool: {
        max: 20,
        min: 2,
        acquire: 30000,
        idle: 10000,
        evict: 1000
      },
      dialectOptions: {
        // Supabase and production PostgreSQL require SSL
        ssl: (isProduction || isSupabase) ? {
          require: true,
          rejectUnauthorized: false,
          // Additional SSL options for better compatibility
          sslmode: 'require'
        } : false,
        // Connection timeout for Supabase
        connectTimeout: 10000
      },
      retry: {
        match: [
          /ETIMEDOUT/,
          /EHOSTUNREACH/,
          /ECONNRESET/,
          /ECONNREFUSED/,
          /ETIMEDOUT/,
          /ESOCKETTIMEDOUT/,
          /EHOSTUNREACH/,
          /EPIPE/,
          /EAI_AGAIN/,
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/
        ],
        max: 3
      }
    });
  } else if (isProduction) {
    // Production should always use PostgreSQL
    throw new Error('DATABASE_URL or Supabase credentials must be set in production environment');
  } else {
    // Use SQLite locally for development when no DATABASE_URL is provided
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: env.NODE_ENV === 'development' ? (sql) => logger.debug(sql) : false,
      define: {
        timestamps: true,
        underscored: true,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  }
}

// Test connection
sequelize.authenticate()
  .then(() => {
    logger.info('Database connection has been established successfully.');
  })
  .catch((err) => {
    logger.error('Unable to connect to the database:', err);
  });

export { sequelize };
