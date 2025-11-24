# 📍 Finding Connection String on Settings Page

## You're on the Right Page!

You're on the Database Settings page. The connection string should be somewhere on this page.

## Look For:

### Option 1: Connection String Section
- **Scroll down** on this page
- Look for a section titled:
  - **"Connection string"**
  - **"Connection info"**
  - **"Database connection"**
  - **"Connection URI"**

### Option 2: Check Tabs
- Look at the **top of the page** - are there any tabs?
- Common tabs: "General", "Connection", "Pooling", "SSL"
- Click on **"Connection"** tab if you see it

### Option 3: Check API Settings Instead
The connection string might be in API Settings instead:

1. **Go to:** https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/api
2. **Look for:** "Database URL" or "Connection string" section

### Option 4: Try the Docs Button
1. Click the **"Docs"** button (with book icon) next to "Connection pooling configuration"
2. The documentation might show the connection format

### Option 5: Use the Database Password Info
Since you can see "Database password" section:
- The connection string format is: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
- Your password: `0692151207@Lj` (URL-encoded: `0692151207%40Lj`)

## Alternative: Construct It Manually

Since we know:
- Project: `jmntfhcjvxlyxlyipgvk`
- Password: `0692151207@Lj`
- Region: We need to find this, or try common regions

Try these connection strings in your `.env` file:

### Format 1 (Direct):
```env
DATABASE_URL=postgresql://postgres:0692151207%40Lj@db.jmntfhcjvxlyxlyipgvk.supabase.co:5432/postgres
```

### Format 2 (Pooler - try different regions):
```env
# Try sa-east-1 first (South America)
DATABASE_URL=postgresql://postgres.jmntfhcjvxlyxlyipgvk:0692151207%40Lj@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

If that doesn't work, try:
```env
# US East
DATABASE_URL=postgresql://postgres.jmntfhcjvxlyxlyipgvk:0692151207%40Lj@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

```env
# Europe
DATABASE_URL=postgresql://postgres.jmntfhcjvxlyxlyipgvk:0692151207%40Lj@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

## Quick Test

1. Update your `.env` file with one of the connection strings above
2. Run:
   ```bash
   npm run db:test
   ```
3. If it works, you're good! If not, try the next region.


















