# Fix Admin Login Issues

If you're having trouble logging in as admin, follow these steps:

## Quick Fix

1. **Run the fix script with your admin email:**
   ```bash
   cd backend
   npm run fix:admin your-admin-email@example.com
   ```

2. **The script will:**
   - Find your user in the database
   - Update your role to 'admin' if needed
   - Set Firebase custom claims (if Firebase UID is available)
   - Provide clear instructions for next steps

## Common Issues and Solutions

### Issue 1: "Admin user not found in database"

**Problem:** Your Firebase account exists but you're not in the database.

**Solution:**
1. First, make sure you've logged in at least once (this creates your user record)
2. Then run: `npm run fix:admin your-email@example.com`

### Issue 2: "Admin privileges required"

**Problem:** Your user exists but doesn't have the 'admin' role.

**Solution:**
```bash
npm run fix:admin your-email@example.com
```

This will update your role to 'admin'.

### Issue 3: Firebase UID mismatch

**Problem:** Your Firebase UID doesn't match the one in the database.

**Solution:**
The improved authentication middleware will now:
- Try to find you by email if Firebase UID doesn't match
- Automatically update your Firebase UID on first match

Just log in again after running the fix script.

## Step-by-Step Process

1. **Check if you exist in the database:**
   ```bash
   npm run fix:admin
   ```
   (Without email - this will show all users)

2. **Fix your admin account:**
   ```bash
   npm run fix:admin your-email@example.com
   ```

3. **Login with Firebase:**
   - Go to the frontend
   - Login with your Firebase credentials
   - Your Firebase UID will be automatically saved

4. **Set Firebase custom claims (if needed):**
   - After logging in, run the fix script again
   - It will set Firebase custom claims automatically

5. **Access admin dashboard:**
   - You should now be able to access admin routes

## Manual Database Check

If you want to check your user status manually:

```sql
SELECT id, email, role, firebase_uid, is_verified 
FROM users 
WHERE email = 'your-email@example.com';
```

Your user should have:
- `role = 'admin'`
- `firebase_uid` set (after first login)
- `is_verified = true`

## Still Having Issues?

1. **Check backend logs** for detailed error messages
2. **Verify Firebase is configured** correctly
3. **Ensure database connection** is working
4. **Check that your email** matches exactly (case-sensitive in some databases)

## Notes

- The authentication middleware now tries to find users by email if Firebase UID doesn't match
- Firebase custom claims are optional but recommended for better security
- The role in the database is the primary check for admin access







