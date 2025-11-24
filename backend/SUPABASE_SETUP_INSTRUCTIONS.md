# 🚀 Supabase Database Setup - Complete Instructions

## ✅ What's Already Done

1. ✅ Supabase credentials configured in `.env` file
2. ✅ Database configuration updated to use Supabase
3. ✅ Table creation script created (`scripts/setup-supabase-tables.ts`)
4. ✅ Environment setup script created (`scripts/create-env-supabase.js`)

## 📝 What You Need to Do

### Step 1: Get the Correct Connection String from Supabase

1. **Go to your Supabase Dashboard:**
   - URL: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/database

2. **Find the Connection String:**
   - Scroll to the **"Connection string"** section
   - Select the **"URI"** tab
   - Choose **"Direct connection"** (NOT session mode)
   - Copy the connection string

3. **It should look like one of these formats:**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.jmntfhcjvxlyxlyipgvk.supabase.co:5432/postgres
   ```
   OR
   ```
   postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```

4. **Important:** 
   - Replace `[YOUR-PASSWORD]` with your actual password: `0692151207@Lj`
   - URL-encode special characters: `@` becomes `%40`
   - So the password becomes: `0692151207%40Lj`

### Step 2: Update Your .env File

1. **Open** `backend/.env` file
2. **Find** the `DATABASE_URL` line
3. **Replace** it with the connection string from Supabase (with URL-encoded password)
4. **Save** the file

Example:
```env
DATABASE_URL=postgresql://postgres:0692151207%40Lj@db.jmntfhcjvxlyxlyipgvk.supabase.co:5432/postgres
```

### Step 3: Test the Connection

```bash
cd backend
npm run db:test
```

If successful, you should see:
```
✅ Database connection established successfully
```

### Step 4: Create Tables

Once the connection works, create all tables:

```bash
npm run setup:supabase:tables
```

This will:
- Connect to your Supabase database
- Create all required tables based on your Sequelize models
- Show you a list of created tables

### Step 5: Verify Tables in Supabase Dashboard

1. Go to: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/editor
2. Check the **Table Editor** or **Database** section
3. You should see all your tables:
   - users
   - listings
   - bookings
   - notifications
   - payments
   - reviews
   - etc.

## 🔧 Available Commands

```bash
# Create/update .env with Supabase config
npm run setup:supabase:env

# Create tables in Supabase
npm run setup:supabase:tables

# Both (env + tables)
npm run setup:supabase

# Test database connection
npm run db:test
```

## 🆘 Troubleshooting

### Error: "getaddrinfo ENOENT"
- **Problem:** DNS resolution failure - connection string hostname is wrong
- **Solution:** Get the correct connection string from Supabase Dashboard → Settings → Database

### Error: "Tenant or user not found"
- **Problem:** Connection string format is incorrect
- **Solution:** Use the connection string exactly as shown in Supabase Dashboard

### Error: "password authentication failed"
- **Problem:** Password is incorrect or not URL-encoded properly
- **Solution:** 
  - Verify password in Supabase Dashboard
  - URL-encode special characters (`@` → `%40`)

### Error: "Connection timeout"
- **Problem:** Network/firewall issue or incorrect port
- **Solution:** 
  - Check your internet connection
  - Verify the port (should be 5432 for direct connection)
  - Try connection pooler if direct doesn't work

## 📚 Your Supabase Project Info

- **Project URL:** https://jmntfhcjvxlyxlyipgvk.supabase.co
- **Dashboard:** https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk
- **Database Settings:** https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/database
- **API Settings:** https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/api

## ✨ Next Steps After Tables Are Created

1. **Set up Row Level Security (RLS):** Configure security policies in Supabase Dashboard
2. **Create Indexes:** Add indexes for frequently queried columns
3. **Seed Initial Data:** Run seed scripts if you have initial data
4. **Start Development:** Run `npm run dev` to start your backend

## 📞 Need Help?

If you're still having connection issues:
1. Double-check the connection string in Supabase Dashboard
2. Verify your database password is correct
3. Make sure URL encoding is correct for special characters
4. Check Supabase project status (might still be provisioning)


















