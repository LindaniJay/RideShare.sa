# How to Manually Add Admin User to Firebase

This guide explains how to manually add an admin user to Firebase Authentication and set up their admin role.

## Method 1: Using Firebase Console (Manual)

### Step 1: Add User to Firebase Authentication

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: **RIDESHARE SA** (or your project name)

2. **Navigate to Authentication**
   - Click on **"Authentication"** in the left sidebar
   - Click on the **"Users"** tab

3. **Add New User**
   - Click the **"Add user"** button (usually at the top)
   - Enter the user's **email address**
   - Enter a **password** (minimum 6 characters)
   - Click **"Add user"**

4. **Note the User UID**
   - After creating the user, you'll see their **UID** (User ID)
   - Copy this UID - you'll need it for the next steps
   - Example UID: `Uw0h1YsDHVdXm5N06IqPd8OdRCn1`

### Step 2: Set Firebase Custom Claims (Admin Role)

You have two options:

#### Option A: Using Firebase Admin SDK (Recommended)

Run this command in the backend directory:

```bash
cd backend
npm run add:admin <email> <password> <firstName> <lastName> [phone]
```

Example:
```bash
npm run add:admin admin@example.com Admin123! John Doe +27123456789
```

This script will:
- Create the user in Firebase (if not exists)
- Create/update the user in the database with `role: 'admin'`
- Set Firebase custom claims (`admin: true, role: 'admin'`)

#### Option B: Using Firebase Console (Manual)

1. **Go to Firebase Console → Authentication → Users**
2. **Find the user you just created**
3. **Click on the user's email/UID**
4. **Scroll down to "Custom claims"**
5. **Click "Add custom claim"**
6. **Add the following claims:**
   - Key: `admin` → Value: `true`
   - Key: `role` → Value: `admin`
7. **Click "Save"**

### Step 3: Add User to Database

After setting Firebase custom claims, you need to add the user to your PostgreSQL database:

```bash
cd backend
npm run add:admin <email> <password> <firstName> <lastName>
```

Or if the user already exists in Firebase, use:

```bash
npm run fix:admin <email>
```

This will:
- Find or create the user in the database
- Set their role to `admin`
- Link their Firebase UID to the database record

### Step 4: Sync Firestore (Optional but Recommended)

To ensure the role is also set in Firestore:

```bash
npm run sync:firestore-role <email>
```

## Method 2: Using Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set custom claims using Firebase CLI
firebase auth:users:set <USER_UID> --custom-claims '{"admin":true,"role":"admin"}'
```

## Verification

After completing the steps:

1. **Check Firebase Authentication**
   - Go to Firebase Console → Authentication → Users
   - Find your user
   - Verify custom claims show: `admin: true, role: admin`

2. **Check Database**
   - Run: `npm run fix:admin <email>`
   - Should show: `Role: admin`

3. **Test Login**
   - Log out from the frontend
   - Log in with the new admin credentials
   - You should be redirected to `/admin-dashboard`

## Troubleshooting

### User can't access admin dashboard

1. **Check Firebase Custom Claims:**
   ```bash
   # In Firebase Console, check the user's custom claims
   # Should show: { "admin": true, "role": "admin" }
   ```

2. **Check Database Role:**
   ```bash
   npm run fix:admin <email>
   # Should show: Role: admin
   ```

3. **Sync Firestore:**
   ```bash
   npm run sync:firestore-role <email>
   # Should update Firestore role to: admin
   ```

4. **Clear Browser Cache:**
   - Log out completely
   - Clear browser cache/cookies
   - Log in again

### Custom Claims Not Working

Firebase custom claims are cached in the ID token. After setting claims:
- User must **log out and log back in** for the new claims to take effect
- Or wait up to 1 hour for the token to refresh automatically

## Quick Reference Commands

```bash
# Add new admin user (creates in Firebase + Database + sets claims)
npm run add:admin <email> <password> <firstName> <lastName> [phone]

# Fix existing user to admin (updates database role + sets claims)
npm run fix:admin <email>

# Sync Firestore role with database
npm run sync:firestore-role <email>
```

## Notes

- **Firebase UID** is required for setting custom claims
- **Database user** must exist with `role: 'admin'` for backend authentication
- **Firestore role** should match database role for frontend consistency
- Users must **log out and log back in** after custom claims are set







