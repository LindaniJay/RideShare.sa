# Firestore Security Rules

## 📋 Overview
This document provides Firestore security rules to fix the "Missing or insufficient permissions" errors.

## 🔧 Recommended Firestore Security Rules

Copy these rules to your Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Allow read: if user is authenticated and owns the document
      // Allow write: if user is authenticated and owns the document OR is creating their own document
      allow read: if isAuthenticated() && isOwner(userId);
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if isAuthenticated() && isOwner(userId);
      
      // Allow backend service account to read/write all user documents
      // This is handled by Firebase Admin SDK which bypasses security rules
    }
    
    // Bookings collection (if you use Firestore for bookings)
    match /bookings/{bookingId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }
    
    // Vehicles collection (if you use Firestore for vehicles)
    match /vehicles/{vehicleId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }
    
    // Messages collection (if you use Firestore for messages)
    match /messages/{messageId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }
    
    // Default: Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🚀 Quick Setup Instructions

### Option 1: Via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ride-share-56610`
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the existing rules with the rules above
5. Click **Publish**

### Option 2: Via Firebase CLI (if installed)

1. Create a file `firestore.rules` in your project root:
   ```bash
   firebase init firestore
   ```
2. Copy the rules above to `firestore.rules`
3. Deploy:
   ```bash
   firebase deploy --only firestore:rules
   ```

## 🔒 Development Mode Rules (More Permissive)

For development/testing, you can use these more permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write all documents
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **Warning**: These rules are too permissive for production! Use them only during development.

## 📝 Current Issue

The permission errors you're seeing are because:
1. Firestore security rules are likely in test mode or too restrictive
2. The frontend code is trying to read/write user documents without proper authentication context
3. Rules need to allow users to create/update their own user documents

## ✅ After Applying Rules

After updating the Firestore rules:
1. Users will be able to create their user document on signup
2. Users will be able to read/update their own user document
3. Permission errors should disappear

## 🔍 Testing Rules

You can test rules using the Firebase Console:
1. Go to Firestore Database → Rules
2. Click "Rules Playground"
3. Test different scenarios (authenticated/unauthenticated reads/writes)

## 📚 Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Security Rules Best Practices](https://firebase.google.com/docs/rules/rules-best-practices)


















