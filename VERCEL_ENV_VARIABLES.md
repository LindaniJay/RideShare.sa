# 🔐 Vercel Environment Variables

## 📋 Required Environment Variables

Copy these to your Vercel Dashboard → Project Settings → Environment Variables:

### Firebase Configuration
```
VITE_FIREBASE_API_KEY=AIzaSyCUn6sq5qode0tO73tfDgXneg03_CobxjI
VITE_FIREBASE_AUTH_DOMAIN=ride-share-56610.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ride-share-56610
VITE_FIREBASE_STORAGE_BUCKET=ride-share-56610.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1074725088115
VITE_FIREBASE_APP_ID=1:1074725088115:web:9d53e6c7b24a497cf3b306
VITE_FIREBASE_MEASUREMENT_ID=G-XN91B7PKY4
```

### API Configuration
```
# Replace with your actual backend production URL
VITE_API_URL=https://your-backend-api.vercel.app/api

# Or if using custom domain:
# VITE_API_URL=https://api.rideshare.co.za/api
```

### Optional Variables
```
VITE_BASE_PATH=/
VITE_WS_URL=wss://your-backend-api.vercel.app
```

## 🚀 Quick Setup Steps

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select Your Project** (or create new)
3. **Go to Settings** → **Environment Variables**
4. **Add each variable** above
5. **Set for**: Production, Preview, and Development
6. **Redeploy** to apply changes

## 📝 Notes

- Replace `VITE_API_URL` with your actual backend production URL
- All `VITE_*` variables are exposed to the browser (public)
- Never add secrets that start with `VITE_`
- Firebase keys are safe to expose (they're meant to be public)


















