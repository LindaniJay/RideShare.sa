# 🚀 Vercel Deployment Guide

## 📋 Quick Deploy

### Option 1: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# For production deployment
vercel --prod
```

### Option 2: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

## 🔧 Environment Variables Setup

In Vercel Dashboard → Project Settings → Environment Variables, add:

### Required Variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCUn6sq5qode0tO73tfDgXneg03_CobxjI
VITE_FIREBASE_AUTH_DOMAIN=ride-share-56610.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ride-share-56610
VITE_FIREBASE_STORAGE_BUCKET=ride-share-56610.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1074725088115
VITE_FIREBASE_APP_ID=1:1074725088115:web:9d53e6c7b24a497cf3b306
VITE_FIREBASE_MEASUREMENT_ID=G-XN91B7PKY4

# API Configuration (Replace with your backend URL)
VITE_API_URL=https://your-backend-api.vercel.app/api
# Or use your backend domain:
# VITE_API_URL=https://api.rideshare.co.za/api
```

### Optional Variables:

```env
# Base Path (if deploying to subdirectory)
VITE_BASE_PATH=/

# WebSocket URL
VITE_WS_URL=wss://your-backend-api.vercel.app
```

## 📝 Deployment Checklist

### Before Deploying:

- [ ] Backend API is deployed (Railway, Render, Vercel Serverless, etc.)
- [ ] Backend URL is ready for production
- [ ] Firebase project is configured for production domain
- [ ] Environment variables are set in Vercel dashboard
- [ ] Firestore security rules updated for production
- [ ] CORS is configured on backend for production domain

### During Deployment:

- [ ] Connect GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Configure build settings
- [ ] Add all environment variables
- [ ] Deploy!

### After Deployment:

- [ ] Verify site loads correctly
- [ ] Test authentication (signup/login)
- [ ] Test API calls work
- [ ] Check console for errors
- [ ] Verify Firebase connection
- [ ] Test admin dashboard (if applicable)

## 🎯 Vercel Configuration

The `frontend/vercel.json` is already configured with:

```json
{
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

This ensures React Router works correctly with Vercel's routing.

## 🔗 Backend Deployment

**Important**: The backend needs to be deployed separately!

### Option 1: Vercel Serverless Functions (Recommended for API routes)

Deploy backend API routes as Vercel serverless functions.

### Option 2: Railway/Render/Heroku

Deploy backend as a separate Node.js application:

1. **Railway**: https://railway.app
2. **Render**: https://render.com  
3. **Fly.io**: https://fly.io

### Option 3: Vercel API Routes

Convert backend routes to Vercel serverless functions in `/api` directory.

## 📊 Build Settings

### Vercel Dashboard Settings:

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node Version**: 18.x or higher

## 🔒 Production Considerations

1. **Update API URLs**: Set `VITE_API_URL` to your production backend URL
2. **Firebase Config**: Ensure Firebase is configured for production domain
3. **Firestore Rules**: Update security rules for production
4. **CORS**: Configure backend CORS for production frontend URL
5. **SSL/HTTPS**: Vercel provides this automatically

## 🐛 Troubleshooting

### Build Fails:
- Check Node version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### API Calls Fail:
- Verify `VITE_API_URL` is set correctly
- Check backend CORS configuration
- Ensure backend is deployed and accessible

### Firebase Errors:
- Verify Firebase config environment variables
- Check Firestore security rules
- Ensure Firebase project allows your production domain

## ✅ Post-Deployment Steps

1. Test all authentication flows
2. Verify API endpoints work
3. Check console for errors
4. Test on mobile devices
5. Monitor Vercel analytics
6. Set up custom domain (optional)

---

**Ready to deploy?** Run `vercel` in the frontend directory or connect via Vercel dashboard! 🚀


















