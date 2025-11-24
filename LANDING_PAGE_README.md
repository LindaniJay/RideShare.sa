# Landing Page Setup

## Overview
The landing page is now a **completely standalone HTML file** that is separate from the React platform. Users see the landing page first, then click "Enter Platform" to access the React app.

## File Structure

### Standalone Landing Page
- **File**: `marketing.html`
- **Status**: Fully standalone - no React dependencies
- **Purpose**: Marketing/informational page shown BEFORE the platform

### React Platform
- **File**: `index.html` (React app entry point)
- **Routes**: All platform routes start from `/`
- **Status**: Main application platform

## How It Works

1. **User visits the site** → Sees `marketing.html` (standalone landing page)
2. **User clicks "Enter Platform"** → Redirects to `index.html` (React app)
3. **User is now in the platform** → Can use all React app features

## Setup for Development

### Option 1: Manual Access (Current)
- Open `marketing.html` directly in browser to see landing page
- Click "Enter Platform" to go to the React app
- Run `npm run dev` to start the React app

### Option 2: Configure Dev Server
You can configure your dev server to serve `marketing.html` as the index:

**For Vite** (if using Vite):
```js
// vite.config.ts
export default {
  // ... other config
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        landing: './marketing.html'
      }
    }
  }
}
```

**For Static Server**:
- Serve `marketing.html` at root `/`
- Serve React app at `/app` or configure routing

## Links in Landing Page

All links in `marketing.html` point to the React app:
- `./index.html` - Main platform entry
- `./index.html#/search` - Search page
- `./index.html#/signup` - Sign up page
- `./index.html#/about` - About page

## Production Deployment

### Option 1: Separate Landing Page
1. Deploy `marketing.html` as the main entry point
2. Deploy React app separately
3. Update links in `marketing.html` to point to React app URL

### Option 2: Same Domain
1. Serve `marketing.html` at root `/`
2. Serve React app at `/app` or subdomain
3. Update links accordingly

### Option 3: Redirect Setup
1. Configure server to show `marketing.html` first
2. After user clicks "Enter Platform", serve React app
3. Use session/localStorage to remember user choice

## Current Status

✅ Landing page removed from React app routes
✅ React app restored to default `/` route
✅ Standalone HTML has all links pointing to React app
✅ Landing page is completely independent

## Notes

- The landing page uses the same background image as the platform
- All styles are inline - no external dependencies
- Works in any modern browser
- Fully responsive and mobile-friendly
- Can be deployed independently or together with the React app









