import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';
import { logger } from '../utils/logger';

// Supabase client instance
let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

/**
 * Initialize Supabase client for client-side operations (uses anon key)
 * This client respects Row Level Security (RLS) policies
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    logger.warn('Supabase client not initialized: SUPABASE_URL and SUPABASE_ANON_KEY must be set');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false, // For server-side usage
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-client-info': 'ridesharex-backend',
        },
      },
    });

    logger.info('Supabase client initialized successfully');
  }

  return supabaseClient;
};

/**
 * Initialize Supabase admin client for server-side operations (uses service role key)
 * This client bypasses Row Level Security (RLS) policies
 * WARNING: Use only for server-side operations that require elevated permissions
 */
export const getSupabaseAdminClient = (): SupabaseClient | null => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    logger.warn('Supabase admin client not initialized: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    return null;
  }

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-client-info': 'ridesharex-backend-admin',
        },
      },
    });

    logger.info('Supabase admin client initialized successfully');
  }

  return supabaseAdminClient;
};

/**
 * Get Supabase connection string for direct PostgreSQL access
 * Supabase provides a connection string that can be used with Sequelize or pg
 */
export const getSupabaseConnectionString = (): string | null => {
  // If DATABASE_URL is already a Supabase connection string, use it
  if (env.DATABASE_URL && (
    env.DATABASE_URL.includes('supabase.co') ||
    env.DATABASE_URL.includes('@db.') ||
    env.DATABASE_URL.startsWith('postgresql://postgres')
  )) {
    return env.DATABASE_URL;
  }

  // If we have Supabase credentials, construct the connection string
  if (env.SUPABASE_URL && env.SUPABASE_DB_PASSWORD) {
    // Extract project reference from SUPABASE_URL
    // Example: https://xyzabc.supabase.co -> xyzabc
    const urlMatch = env.SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (urlMatch && urlMatch[1]) {
      const projectRef = urlMatch[1];
      // Supabase connection string format:
      // postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
      return `postgresql://postgres:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@db.${projectRef}.supabase.co:5432/postgres`;
    }
  }

  return null;
};

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
};

/**
 * Test Supabase connection
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client) {
      logger.warn('Supabase client not available for connection test');
      return false;
    }

    // Simple query to test connection
    const { data, error } = await client.from('_prisma_migrations').select('id').limit(1);
    
    if (error) {
      logger.error('Supabase connection test failed:', error.message);
      return false;
    }

    logger.info('Supabase connection test successful');
    return true;
  } catch (error: any) {
    logger.error('Supabase connection test error:', error.message);
    return false;
  }
};

export default {
  getSupabaseClient,
  getSupabaseAdminClient,
  getSupabaseConnectionString,
  isSupabaseConfigured,
  testSupabaseConnection,
};

















