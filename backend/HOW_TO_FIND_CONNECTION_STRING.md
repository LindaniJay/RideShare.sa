# 📍 Visual Guide: Finding Supabase Connection String

## Step-by-Step Instructions

### Step 1: Open Your Supabase Project

1. **Go to:** https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk
2. You should see your project dashboard

### Step 2: Navigate to Settings

**Look for the Settings icon:**
- In the **left sidebar**, you'll see various icons
- Find the **⚙️ Settings** icon (gear/cog icon)
- It's usually near the bottom of the sidebar
- Click on it

### Step 3: Find Database Section

Once in Settings, you'll see a menu with options:
- **General**
- **API** 
- **Database** ← **Click this one**
- **Auth**
- **Storage**
- etc.

Click on **"Database"**

### Step 4: Look for Connection Info

On the Database settings page, look for these sections (they might be in different places):

#### Option A: Connection String Section
- Scroll down the page
- Look for a section titled:
  - **"Connection string"**
  - **"Connection info"**
  - **"Database URL"**
  - **"PostgreSQL connection string"**

#### Option B: Connection Pooling Section
- Look for **"Connection pooling"** section
- There might be different connection strings there

#### Option C: Connection Info Card
- Look for a card/box showing:
  - **Host:** (shows something like `db.xxxxx.supabase.co`)
  - **Database name:** (usually `postgres`)
  - **Port:** (usually `5432`)
  - **User:** (usually `postgres`)

### Step 5: What You're Looking For

The connection string will look like one of these:

```
postgresql://postgres:[PASSWORD]@db.jmntfhcjvxlyxlyipgvk.supabase.co:5432/postgres
```

OR

```
postgresql://postgres.jmntfhcjvxlyxlyipgvk:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

## Alternative: Where Else to Look

### Option 1: Check the SQL Editor

1. Go to: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/editor
2. Click on **"SQL Editor"** in the left sidebar
3. At the top, there might be connection info

### Option 2: Check Project Settings → General

1. Go to: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/general
2. Look for database connection information there

### Option 3: Check the Connection String Directly in URL

Sometimes you can find it by:
1. Right-click anywhere on the Database settings page
2. Click **"Inspect"** or **"View Source"**
3. Search for: `postgresql://` in the page source

## If You Still Can't Find It

### Option 1: Check Your Project Region

1. Go to: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/general
2. Look for **"Region"** field
3. Note the region (e.g., `sa-east-1`, `us-east-1`, etc.)

Then use this format:
```
postgresql://postgres.jmntfhcjvxlyxlyipgvk:0692151207%40Lj@aws-0-[YOUR-REGION].pooler.supabase.com:5432/postgres
```

Replace `[YOUR-REGION]` with your actual region.

### Option 2: Contact Supabase Support

If you can't find the connection string:
1. Go to: https://supabase.com/support
2. Ask for help finding your database connection string
3. Provide your project reference: `jmntfhcjvxlyxlyipgvk`

### Option 3: Use Supabase CLI

If you have Supabase CLI installed:
```bash
supabase projects list
supabase projects get-connection-string jmntfhcjvxlyxlyipgvk
```

## Quick Checklist

When you find the connection string, make sure:
- ✅ It starts with `postgresql://`
- ✅ It includes your password (or has `[YOUR-PASSWORD]` placeholder)
- ✅ It includes the hostname (something with `supabase.co` or `pooler.supabase.com`)
- ✅ It includes port `5432` or `6543`
- ✅ It ends with `/postgres`

## Screenshots Description

**What you should see:**

```
Settings
├── General
├── API
├── Database  ← Click here
│   ├── Connection string
│   │   └── postgresql://postgres:...
│   ├── Connection pooling
│   └── ...
```

## Still Having Trouble?

1. **Take a screenshot** of your Database settings page
2. Look for any field that says:
   - "Connection"
   - "Database"
   - "PostgreSQL"
   - "URI"
   - "URL"
3. Share what you see, and I can help you identify the correct field


















