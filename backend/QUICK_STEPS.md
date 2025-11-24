# 🎯 Quick Steps to Get Connection String

## Right Now - In Your Supabase Dashboard:

1. ✅ You're in the **Database** section (good!)

2. 👀 Look at the **"CONFIGURATION"** section in the sidebar

3. 🖱️ **Click on "Settings"** (it's under "CONFIGURATION", below "Roles" and "Policies")

4. 📋 On the Settings page, find the **"Connection string"** or **"URI"** field

5. 📝 **Copy the entire connection string** (it starts with `postgresql://`)

6. ✏️ **Update your `.env` file** with the connection string

## Once You Have It:

1. Open `backend/.env` file
2. Find the line: `DATABASE_URL=...`
3. Replace it with your copied connection string
4. Make sure the password is URL-encoded:
   - `@` becomes `%40`
   - So if password is `0692151207@Lj`, use `0692151207%40Lj` in the connection string

5. Save the file

6. Test connection:
   ```bash
   npm run db:test
   ```

7. Create tables:
   ```bash
   npm run setup:supabase:tables
   ```

## If You Can't Find It

After clicking "Settings", tell me:
- What sections/fields do you see on that page?
- Any field that mentions "connection", "database", "URI", or "URL"?

I'll help you identify the correct field!


















