# 🔥 Firebase Setup Guide for RideShareX

This comprehensive guide will walk you through setting up Firebase for your RideShareX application, including Authentication, Firestore Database, and Storage.

## 📋 Prerequisites

1. A Google account
2. Node.js installed on your development machine
3. Access to your project's backend and frontend directories

## 🚀 Step 1: Create a Firebase Project

### 1.1 Go to Firebase Console

1. Visit [https://console.firebase.google.com](https://console.firebase.google.com)
2. Sign in with your Google account

### 1.2 Create a New Project

1. Click **"Add project"** or **"Create a project"**
2. Enter project details:
   - **Project name**: `RideShareX` (or your preferred name)
   - **Project ID**: Will be auto-generated (e.g., `ride-share-56610`)
   - Note down the Project ID - you'll need it later!
3. Click **"Continue"**

### 1.3 Configure Google Analytics (Optional but Recommended)

1. Choose whether to enable Google Analytics
   - ✅ **Recommended**: Enable for production apps
   - ❌ **Skip**: For development/testing only
2. If enabling:
   - Select or create a Google Analytics account
   - Accept terms and continue
3. Click **"Create project"**
4. Wait for Firebase to set up your project (30-60 seconds)

### 1.4 Project Dashboard

Once created, you'll be redirected to your Firebase project dashboard. You're now ready to configure services!

---

## 🔐 Step 2: Enable Authentication

### 2.1 Navigate to Authentication

1. In the Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"**

### 2.2 Enable Sign-in Methods

For RideShareX, you'll need email/password authentication:

1. Click on the **"Sign-in method"** tab
2. Click on **"Email/Password"**
3. Toggle **"Enable"** to ON
4. Optionally enable **"Email link (passwordless sign-in)"** if needed
5. Click **"Save"**

### 2.3 Configure Authorized Domains (for Production)

1. In the Authentication settings, go to **"Settings"** tab
2. Under **"Authorized domains"**, add your production domains:
   - Your Vercel domain (e.g., `ridesharex.vercel.app`)
   - Your custom domain (e.g., `rideshare.co.za`)
   - `localhost` is already included for development

---

## 🗄️ Step 3: Set Up Firestore Database

### 3.1 Create Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**

### 3.2 Choose Security Mode

For **Development**:
- Select **"Start in test mode"**
- ⚠️ **Important**: This allows read/write access to anyone. Only use for development!

For **Production**:
- Select **"Start in production mode"**
- You'll need to set up security rules (see Step 6)

### 3.3 Choose Location

1. Select a database location closest to your users
   - For South Africa: Choose `europe-west` or `asia-south1`
   - For global: Choose `us-central1` or `europe-west1`
2. Click **"Enable"**
3. Wait for the database to be created

### 3.4 Create Initial Collections (Optional)

You can create collections manually or they'll be created automatically by your app:

- `users` - User profiles and data
- `vehicles` - Vehicle listings
- `bookings` - Booking records
- `notifications` - User notifications

---

## 📦 Step 4: Set Up Storage

### 4.1 Enable Storage

1. Click **"Storage"** in the left sidebar
2. Click **"Get started"**

### 4.2 Configure Storage Rules

1. Choose security rules:
   - **Test mode** for development (allows read/write)
   - **Production mode** for production (requires security rules)

2. Choose storage location (same as Firestore recommended)

3. Click **"Done"**

### 4.3 Create Storage Buckets (Optional)

Your app will automatically create folders as needed:
- `vehicle-images/` - Vehicle photos
- `user-documents/` - User uploaded documents
- `profile-pictures/` - User profile images

---

## 🔑 Step 5: Generate Service Account (Backend)

### 5.1 Access Project Settings

1. Click the **⚙️ gear icon** next to "Project Overview"
2. Select **"Project settings"**

### 5.2 Generate Service Account Key

1. Go to the **"Service accounts"** tab
2. Click **"Generate new private key"**
3. Click **"Generate key"** in the popup
4. A JSON file will download - **SAVE THIS FILE SECURELY!**
   - ⚠️ **Never commit this file to Git!**
   - ⚠️ **Keep it private and secure!**

### 5.3 Save the Service Account File

1. Move the downloaded JSON file to your backend directory:
   ```
   backend/firebase-service-account.json
   ```

2. Update your `.gitignore` to ensure it's not committed:
   ```
   # Firebase
   firebase-service-account.json
   *.json
   !package.json
   !tsconfig.json
   ```

---

## 📝 Step 6: Get Frontend Configuration

### 6.1 Get Web App Configuration

1. In Firebase Console, click the **⚙️ gear icon** → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** `</>` to add a web app
4. Register your app:
   - **App nickname**: `RideShareX Web` (or any name)
   - **Firebase Hosting**: Skip (you're using Vercel)
5. Click **"Register app"**

### 6.2 Copy Configuration Values

You'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCUn6sq5qode0tO73tfDgXneg03_CobxjI",
  authDomain: "ride-share-56610.firebaseapp.com",
  projectId: "ride-share-56610",
  storageBucket: "ride-share-56610.firebasestorage.app",
  messagingSenderId: "1074725088115",
  appId: "1:1074725088115:web:9d53e6c7b24a497cf3b306",
  measurementId: "G-XN91B7PKY4"
};
```

**Copy these values!** You'll need them for your frontend configuration.

---

## ⚙️ Step 7: Configure Backend

### 7.1 Update Backend Environment Variables

Create or update `backend/.env`:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=ride-share-56610
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Alternative: Use individual credentials (if not using service account file)
# FIREBASE_PRIVATE_KEY_ID=your-private-key-id
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# FIREBASE_CLIENT_ID=your-client-id
```

### 7.2 Verify Service Account File

Ensure `firebase-service-account.json` is in your `backend/` directory and has this structure:

```json
{
  "type": "service_account",
  "project_id": "ride-share-56610",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@ride-share-56610.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

---

## 🎨 Step 8: Configure Frontend

### 8.1 Update Frontend Environment Variables

Create or update `frontend/.env.local`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCUn6sq5qode0tO73tfDgXneg03_CobxjI
VITE_FIREBASE_AUTH_DOMAIN=ride-share-56610.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ride-share-56610
VITE_FIREBASE_STORAGE_BUCKET=ride-share-56610.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1074725088115
VITE_FIREBASE_APP_ID=1:1074725088115:web:9d53e6c7b24a497cf3b306
VITE_FIREBASE_MEASUREMENT_ID=G-XN91B7PKY4

# API Configuration
VITE_API_URL=http://localhost:5001/api
```

### 8.2 Verify Frontend Firebase Config

Your `frontend/src/config/firebase.ts` should already be configured to read from environment variables. Verify it matches your setup.

---

## 🔒 Step 9: Set Up Security Rules

### 9.1 Firestore Security Rules

Go to **Firestore Database** → **Rules** tab and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Vehicles: Anyone can read, only owners can write
    match /vehicles/{vehicleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.resource.data.hostId == request.auth.uid;
    }
    
    // Bookings: Users can read their own bookings
    match /bookings/{bookingId} {
      allow read: if request.auth != null && 
        (resource.data.renterId == request.auth.uid || 
         resource.data.hostId == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.renterId == request.auth.uid || 
         resource.data.hostId == request.auth.uid);
    }
    
    // Notifications: Users can only read their own notifications
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

Click **"Publish"** to save rules.

### 9.2 Storage Security Rules

Go to **Storage** → **Rules** tab and add:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Vehicle images: Anyone can read, only authenticated users can upload
    match /vehicle-images/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // User documents: Only the owner can access
    match /user-documents/{userId}/{documentId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Profile pictures: Anyone can read, only owner can write
    match /profile-pictures/{userId}/{pictureId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

Click **"Publish"** to save rules.

---

## ✅ Step 10: Test Your Setup

### 10.1 Test Backend Connection

```bash
cd backend
npm run test:firebase
```

You should see:
```
✅ Firebase Admin SDK initialized successfully
✅ Firestore and Storage services initialized
```

### 10.2 Test Frontend Connection

1. Start your frontend:
```bash
cd frontend
npm run dev
```

2. Try to sign up/login - you should be able to create users in Firebase Authentication

3. Check Firebase Console → Authentication → Users - you should see your test user

### 10.3 Verify Database

1. Go to Firebase Console → Firestore Database
2. Create a test document manually or let your app create it
3. Verify data appears correctly

---

## 🚀 Step 11: Production Configuration

### 11.1 Update Production Environment Variables

**Vercel (Frontend):**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all `VITE_FIREBASE_*` variables from your `.env.local`
3. Update `VITE_API_URL` to your production backend URL

**Backend (Railway/Render/etc.):**
1. Add environment variables:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_SERVICE_ACCOUNT_PATH` (or individual credentials)
2. Upload `firebase-service-account.json` as a secret file

### 11.2 Update Authorized Domains

1. Firebase Console → Authentication → Settings
2. Add your production domains to **Authorized domains**

### 11.3 Enable Production Security Rules

1. Switch Firestore rules from "test mode" to production rules (Step 9.1)
2. Switch Storage rules from "test mode" to production rules (Step 9.2)

---

## 📚 Additional Firebase Features

### Real-time Database (Alternative to Firestore)

If you need real-time sync, you can enable Realtime Database:
1. Firebase Console → Realtime Database
2. Click "Create database"
3. Choose location and security mode

### Cloud Functions

For serverless functions:
1. Firebase Console → Functions
2. Install Firebase CLI: `npm install -g firebase-tools`
3. Initialize: `firebase init functions`

### Cloud Messaging (Push Notifications)

For push notifications:
1. Firebase Console → Cloud Messaging
2. Get the server key for backend notifications

---

## 🆘 Troubleshooting

### Backend: "Firebase Admin SDK not initialized"

**Solution:**
- Check `FIREBASE_SERVICE_ACCOUNT_PATH` points to the correct file
- Verify the JSON file is valid and has correct permissions
- Ensure the service account has proper IAM roles

### Frontend: "Firebase: Error (auth/invalid-api-key)"

**Solution:**
- Verify `VITE_FIREBASE_API_KEY` is correct in `.env.local`
- Ensure the API key is not restricted (or restrictions allow your domain)
- Clear browser cache and restart dev server

### Firestore: Permission Denied

**Solution:**
- Check security rules are published
- Verify user is authenticated (`request.auth != null`)
- Ensure rules match your data structure

### Storage: Upload Failed

**Solution:**
- Check storage rules allow writes
- Verify file size is within limits
- Check CORS configuration if accessing from web

---

## 📖 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

## ✨ You're All Set!

Your Firebase project is now configured and ready to use with RideShareX! 🎉

Your project should have:
- ✅ Authentication enabled
- ✅ Firestore Database created
- ✅ Storage configured
- ✅ Service account for backend
- ✅ Frontend configuration ready
- ✅ Security rules set up

Happy coding! 🚀

















