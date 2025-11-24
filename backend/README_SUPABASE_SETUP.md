# 🎯 Quick Start: Supabase Setup

## Current Status

✅ **Configured:**
- Supabase credentials in `.env`
- Database configuration updated
- Table creation scripts ready

❌ **Action Required:**
- Get correct connection string from Supabase Dashboard
- Update `DATABASE_URL` in `.env` file
- Run table creation

## Quick Steps

1. **Get Connection String:**
   - Go to: https://app.supabase.com/project/jmntfhcjvxlyxlyipgvk/settings/database
   - Copy the **"URI"** connection string (Direct connection)

2. **Update .env:**
   - Edit `backend/.env`
   - Update `DATABASE_URL` with the connection string
   - **Important:** URL-encode password (`@` → `%40`)

3. **Create Tables:**
   ```bash
   npm run setup:supabase:tables
   ```

4. **Verify:**
   - Check tables in Supabase Dashboard
   - Start server: `npm run dev`

## Detailed Instructions

See: `SUPABASE_SETUP_INSTRUCTIONS.md`


















