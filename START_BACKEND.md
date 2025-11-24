# 🚀 Start Backend Server - Quick Guide

## ⚠️ Current Issue

**Backend server is NOT running on port 5001**

This is why you're seeing:
- `ECONNREFUSED` errors in Vite proxy
- 500 errors for `/api/admin/*` requests
- Connection refused errors

## ✅ Quick Fix

### Step 1: Open a NEW Terminal

Keep your frontend terminal running, open a **NEW terminal window** for the backend.

### Step 2: Navigate to Backend Directory

```bash
cd "C:\Users\Deviare User\ridesharex\backend"
```

### Step 3: Verify .env File Exists

```bash
# If .env doesn't exist, create it:
node create-env.js
```

### Step 4: Start Backend Server

```bash
npm run dev
```

### Step 5: Wait for Server to Start

You should see output like:
```
🚀 RideShare.SA Server running on http://localhost:5001
📱 Environment: development
🔗 Frontend URLs: http://localhost:3000,http://localhost:5173
📊 Socket.io path: /socket.io/
🔗 Health check: http://localhost:5001/api/health
```

## ✅ Verification

Once backend is running:
1. Go back to your browser
2. Hard refresh: `Ctrl + Shift + R`
3. Admin dashboard should work!
4. No more proxy errors in Vite terminal

## 📋 Two Terminals Required

**Terminal 1 (Frontend):**
```bash
cd frontend
npm run dev  # Should already be running on port 3000
```

**Terminal 2 (Backend):**
```bash
cd backend
npm run dev  # Should run on port 5001
```

## 🎯 That's It!

Once the backend server is running on port 5001, all the API calls will work and the errors will disappear!

---

**Note:** Keep both terminals open - one for frontend, one for backend!


















