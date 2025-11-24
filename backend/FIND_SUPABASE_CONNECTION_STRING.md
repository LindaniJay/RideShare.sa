# 🔍 How to Find Your Supabase Connection String

## Method 1: Database Settings Page

### Step-by-Step:

1. **Go to Supabase Dashboard:**
   - URL: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk

2. **Navigate to Settings:**
   - Look for the **⚙️ Settings** icon in the left sidebar
   - Click on it

3. **Go to Database:**
   - In the Settings menu, click on **"Database"**

4. **Find Connection String:**
   - On the Database settings page, look for:
     - **"Connection string"** section
     - **"Connection info"** section
     - **"Database URL"** section
     - Or scroll down to find database connection details

5. **Copy the Connection String:**
   - Look for a field that starts with: `postgresql://`
   - It should look like:
     ```
     postgresql://postgres.jmntfhcjvxlyxlyipgvk:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
     ```

## Method 2: Project Settings → API

Sometimes the connection info is under API settings:

1. **Go to:** https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/api
2. **Look for:** "Database URL" or "Connection string" section
3. **Copy:** The PostgreSQL connection string

## Method 3: Using SQL Editor

You can construct the connection string manually:

1. **Go to SQL Editor:**
   - URL: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/sql/new

2. **Check the connection info** at the top of the SQL Editor

## Method 4: Construct it Manually

If you can't find it, you can construct it manually:

### Your Project Details:
- **Project Reference:** `jmntfhcjvxlyxlyipgvk`
- **Database Password:** `0692151207@Lj` (URL-encoded: `0692151207%40Lj`)
- **Region:** Check your project region in Settings → General

### Connection String Format:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**For your project:**
```
postgresql://postgres:0692151207%40Lj@db.jmntfhcjvxlyxlyipgvk.supabase.co:5432/postgres
```

OR if using connection pooler:

```
postgresql://postgres.jmntfhcjvxlyxlyipgvk:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

## Method 5: Direct Links to Try

Try these direct links:

1. **Database Settings:**
   - https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/database

2. **Connection Pooling:**
   - https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/database?option=connection-pooling

3. **General Settings:**
   - https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/general

## What to Look For

Look for any of these labels:
- "Connection string"
- "Database URL"
- "PostgreSQL connection string"
- "Connection URI"
- "Connection info"
- "Database connection"
- "Connection pooling"

## Alternative: Use the Direct Format

Based on your project reference, try this connection string:

```
postgresql://postgres:0692151207%40Lj@db.jmntfhcjvxlyxlyipgvk.supabase.co:5432/postgres
```

If that doesn't work, try the pooler format. To find your region:

1. Go to: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/general
2. Check the **"Region"** field
3. Common regions:
   - `sa-east-1` (South America - São Paulo)
   - `us-east-1` (US East)
   - `eu-west-1` (Europe - Ireland)
   - `ap-southeast-1` (Asia Pacific)

Then use:
```
postgresql://postgres.jmntfhcjvxlyxlyipgvk:0692151207%40Lj@aws-0-[YOUR-REGION].pooler.supabase.com:5432/postgres
```

## Quick Test

You can try updating your `.env` file with the direct format above and test:

```bash
npm run db:test
```

If it works, you're good to go! If not, we'll need to find the exact format from your dashboard.


















