# Supabase Connection String Guide

## Getting the Correct Connection String

To get the correct connection string for your Supabase project:

1. Go to: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/database
2. Scroll to **"Connection string"** section
3. Select **"URI"** or **"Connection string"** tab
4. Choose **"Direct connection"** (not session mode)
5. Copy the connection string

## Connection String Format

The connection string should look like one of these:

### Direct Connection (Port 5432):
```
postgresql://postgres.jmntfhcjvxlyxlyipgvk:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

### Session Mode (Port 6543):
```
postgresql://postgres.jmntfhcjvxlyxlyipgvk:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Transaction Mode (Port 6543):
```
postgresql://postgres.jmntfhcjvxlyxlyipgvk:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Important Notes

- **URL-encode special characters** in your password:
  - `@` becomes `%40`
  - `!` becomes `%21`
  - `#` becomes `%23`
  - `$` becomes `%24`
  - etc.

- Your password: `0692151207@Lj`
- URL-encoded: `0692151207%40Lj`

## Current Configuration

If you need to update the connection string:

1. Copy the correct connection string from Supabase Dashboard
2. Update `backend/.env` file:
   ```env
   DATABASE_URL=postgresql://postgres.jmntfhcjvxlyxlyipgvk:0692151207%40Lj@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
   ```

## Finding Your Region

To find your project's region:
1. Go to Supabase Dashboard → Settings → General
2. Check the **"Region"** field
3. Use that region in the connection string

Common regions:
- `sa-east-1` (South America - São Paulo)
- `us-east-1` (US East)
- `eu-west-1` (Europe)
- `ap-southeast-1` (Asia Pacific)


















