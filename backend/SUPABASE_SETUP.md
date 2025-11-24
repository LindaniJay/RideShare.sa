# 🚀 Supabase Database Setup Guide

This guide will help you set up Supabase as your database provider for RideShareX.

## 📋 Prerequisites

1. A Supabase account: [Sign up at supabase.com](https://supabase.com)
2. Node.js installed
3. All backend dependencies installed (`npm install`)

## 🔧 Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: ridesharex (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (2-3 minutes)

## 🔑 Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL** (`SUPABASE_URL`): `https://[PROJECT_REF].supabase.co`
   - **anon/public key** (`SUPABASE_ANON_KEY`): Use for client-side operations
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`): Use for server-side admin operations

3. Go to **Settings** → **Database** to find:
   - **Connection string** (`DATABASE_URL`): `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`
   - **Database Password** (`SUPABASE_DB_PASSWORD`): The password you set when creating the project

## 📝 Step 3: Configure Environment Variables

Create or update your `backend/.env` file with the following:

```env
# Supabase Configuration
SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_PASSWORD=your-database-password

# Database Connection (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
```

**Important Notes:**
- Replace `[YOUR_PROJECT_REF]` with your actual project reference
- Replace `[YOUR_PASSWORD]` with your database password
- URL-encode special characters in your password if needed
- The `DATABASE_URL` uses `postgres` as the username (default Supabase user)

## 🔒 Step 4: Database SSL Configuration

Supabase requires SSL connections. The configuration in `backend/src/config/database.ts` automatically detects Supabase connections and enables SSL. No additional configuration needed!

## ✅ Step 5: Test the Connection

### Option A: Using the Supabase Client

```typescript
import { testSupabaseConnection } from './src/config/supabase';

// Test connection
testSupabaseConnection().then(success => {
  if (success) {
    console.log('✅ Supabase connection successful!');
  } else {
    console.error('❌ Supabase connection failed');
  }
});
```

### Option B: Using Sequelize (Existing ORM)

The existing Sequelize setup will automatically use Supabase when `DATABASE_URL` points to a Supabase database:

```bash
# Start the backend server
npm run dev

# You should see:
# ✅ Database connection has been established successfully.
```

## 🎯 Using Supabase Features

### Client-Side Operations (with RLS)

```typescript
import { getSupabaseClient } from './src/config/supabase';

const supabase = getSupabaseClient();

// Example: Query vehicles (respects Row Level Security)
const { data, error } = await supabase
  .from('vehicles')
  .select('*')
  .eq('status', 'available');
```

### Server-Side Operations (Bypass RLS)

```typescript
import { getSupabaseAdminClient } from './src/config/supabase';

const supabaseAdmin = getSupabaseAdminClient();

// Example: Admin query (bypasses Row Level Security)
const { data, error } = await supabaseAdmin
  .from('users')
  .select('*');
```

### Using with Sequelize (Existing Models)

Your existing Sequelize models work seamlessly with Supabase:

```typescript
import { sequelize } from './src/config/database';
import { Vehicle } from './src/models/Vehicle';

// All existing Sequelize queries work with Supabase
const vehicles = await Vehicle.findAll({
  where: { status: 'available' }
});
```

## 🔐 Row Level Security (RLS)

Supabase uses Row Level Security (RLS) for fine-grained access control. You can:

1. **Enable RLS** on tables in Supabase Dashboard → Authentication → Policies
2. **Create policies** for different user roles
3. **Client operations** automatically respect RLS policies
4. **Service role operations** bypass RLS (use carefully!)

## 🚀 Migration from Existing Database

If you're migrating from SQLite or another PostgreSQL database:

1. **Export your data** from the current database
2. **Import to Supabase** using:
   - Supabase SQL Editor
   - pgAdmin
   - Command line: `psql` with connection string
3. **Update environment variables** to point to Supabase
4. **Test thoroughly** before switching production

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase PostgreSQL Guide](https://supabase.com/docs/guides/database)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Troubleshooting

### Connection Timeout
- Check your internet connection
- Verify the `DATABASE_URL` is correct
- Ensure your IP is allowed (if IP restrictions are enabled)

### SSL Certificate Error
- Supabase requires SSL; ensure `dialectOptions.ssl` is configured
- The config file automatically handles this for Supabase URLs

### Authentication Error
- Verify `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check that keys haven't been rotated in Supabase dashboard

### Password Issues
- Ensure database password is URL-encoded in `DATABASE_URL`
- Verify password hasn't been changed in Supabase dashboard

## ✨ Benefits of Supabase

1. **Managed PostgreSQL**: Fully managed database with automatic backups
2. **Built-in Auth**: Authentication and authorization out of the box
3. **Real-time Subscriptions**: Subscribe to database changes
4. **Storage**: File storage integrated
5. **Auto-scaling**: Handles traffic spikes automatically
6. **Free Tier**: Generous free tier for development and small projects

## 🎉 You're All Set!

Your Supabase database is now configured and ready to use. The application will automatically use Supabase when the environment variables are set.

















