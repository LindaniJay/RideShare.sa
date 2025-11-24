# Add Admin User to Firebase

This guide explains how to add a new admin user to Firebase and the database.

## Quick Method (Recommended)

Use the interactive script that creates the user in both Firebase and the database:

```bash
cd backend
npm run add:admin
```

The script will:
1. Ask for email, password, name, and phone
2. Create user in Firebase
3. Set Firebase custom claims (admin: true, role: 'admin')
4. Create user in database with admin role
5. Link Firebase UID to database user

## Manual Method

### Option 1: Using Firebase Console

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com
   - Select your project

2. **Create User:**
   - Go to **Authentication** > **Users**
   - Click **"Add user"**
   - Enter email and password
   - Click **"Add user"**

3. **Set Custom Claims:**
   - After user is created, you need to set custom claims
   - This requires Firebase Admin SDK or Cloud Functions
   - Run: `npm run fix:admin <user-email>` after user logs in once

4. **Create in Database:**
   - Run: `npm run fix:admin <user-email>`
   - This will create the user in database with admin role

### Option 2: Using Firebase Admin SDK (Programmatic)

If you have Firebase Admin SDK configured, use the script:

```bash
npm run add:admin
```

This will:
- Create user in Firebase
- Set custom claims automatically
- Create user in database
- Link everything together

## Step-by-Step Process

### Method 1: Interactive Script (Easiest)

```bash
cd backend
npm run add:admin
```

Follow the prompts:
1. Enter admin email
2. Enter password (min 6 characters)
3. Enter first name (optional)
4. Enter last name (optional)
5. Enter phone (optional)
6. Confirm creation

The script handles everything automatically!

### Method 2: User Self-Registration + Fix Script

1. **User registers normally:**
   - User goes to frontend
   - Signs up with their email
   - This creates Firebase user and database user

2. **Make them admin:**
   ```bash
   npm run fix:admin user-email@example.com
   ```

3. **Set Firebase custom claims:**
   - After user logs in once (to get Firebase UID)
   - Run the fix script again:
   ```bash
   npm run fix:admin user-email@example.com
   ```

### Method 3: Firebase Console + Database Script

1. **Create in Firebase Console:**
   - Go to Firebase Console > Authentication > Users
   - Click "Add user"
   - Enter email and password

2. **Create in Database:**
   ```bash
   npm run fix:admin user-email@example.com
   ```

3. **After first login, set custom claims:**
   ```bash
   npm run add:admin user-email@example.com
   ```

## What Gets Created

### In Firebase:
- User account with email/password
- Custom claims: `{ admin: true, role: 'admin' }`
- Email verified: `true`

### In Database:
- User record with:
  - `role: 'admin'`
  - `isVerified: true`
  - `firebase_uid: <Firebase UID>`
  - All user details (name, email, phone)

## Verification

After adding admin user, verify:

1. **Check Firebase:**
   - Go to Firebase Console > Authentication > Users
   - Find the user
   - Check that custom claims are set

2. **Check Database:**
   ```bash
   npm run fix:admin
   # (without email - shows all users)
   ```

3. **Test Login:**
   - Go to frontend
   - Login with admin credentials
   - Should redirect to admin dashboard

## Troubleshooting

### "Firebase not initialized"
- Make sure `firebase-service-account.json` exists
- Check Firebase environment variables

### "User already exists"
- Script will update existing user
- Or delete user first and recreate

### "Custom claims not set"
- User needs to login once to get Firebase UID
- Then run fix script again

### "Can't access admin dashboard"
- Check user role in database: `npm run fix:admin <email>`
- Verify Firebase custom claims are set
- User may need to logout and login again

## Notes

- **Password Requirements:** Minimum 6 characters (Firebase requirement)
- **Email Verification:** Automatically set to verified for admin users
- **Custom Claims:** Required for admin access in frontend
- **Database Role:** Must be 'admin' for backend API access

## Security

⚠️ **Important:**
- Admin users have full system access
- Use strong passwords
- Limit number of admin users
- Regularly audit admin access
- Change default passwords immediately







