# Landing Page Setup Guide

## Overview
The landing page is now available as a **standalone HTML file** that can be deployed independently or used as the entry point to the platform.

## Files

### 1. Standalone HTML Landing Page
- **File**: `marketing.html` (root directory)
- **Status**: Fully standalone - no dependencies on React or build process
- **Features**:
  - Complete self-contained HTML with inline CSS and JavaScript
  - Same background as the platform
  - Prominent "Enter Platform" button
  - All content about RideShare SA business
  - Responsive design
  - Smooth animations

### 2. React Component Landing Page
- **File**: `frontend/src/pages/Marketing.tsx`
- **Route**: `/` (default route) and `/marketing`, `/welcome`
- **Status**: Integrated into React app
- **Features**: Same content as standalone version, but uses React components

## Usage

### Option 1: Use Standalone HTML (Recommended for Marketing)
1. Deploy `marketing.html` to your web server
2. Access it directly: `https://yourdomain.com/marketing.html`
3. Update the "Enter Platform" button link to point to your platform URL

### Option 2: Use React Component (Current Setup)
1. The React app now shows the Marketing page at `/` by default
2. Users see the landing page first
3. Click "Enter Platform" button to go to `/platform` (main app)

### Option 3: Replace index.html with Standalone Version
If you want the standalone HTML to be the main entry point:
1. Backup current `index.html`
2. Copy `marketing.html` to `index.html`
3. Update all internal links to work with your routing setup

## Background Image
The landing page uses the same background as the platform:
- Image: `background-rideshare.png`
- The standalone HTML tries multiple paths:
  - `./background-rideshare.png`
  - `./frontend/background-rideshare.png`
  - `./public/background-rideshare.png`

Make sure the background image is accessible from where you serve the HTML file.

## Customization

### Update Platform Link
In `marketing.html`, find and update:
```html
<a href="/platform" class="btn btn-enter-platform">
```
Change `/platform` to your actual platform URL.

### Update Background Image Path
If the background image is in a different location, update the `url()` in the CSS:
```css
background: linear-gradient(...), url('./your-path/background-rideshare.png');
```

## Deployment

### Static Hosting (Netlify, Vercel, GitHub Pages)
1. Place `marketing.html` in your public/static directory
2. Configure your hosting to serve it at the root or `/marketing.html`
3. Update links as needed

### Traditional Web Server
1. Upload `marketing.html` to your web root
2. Ensure `background-rideshare.png` is accessible
3. Test all links work correctly

## Current Setup
- **Default Route (`/`)**: Shows Marketing landing page (React component)
- **Platform Route (`/platform`)**: Shows main platform (Home page)
- **Standalone HTML**: Available at `marketing.html` for independent deployment

## Notes
- The standalone HTML is completely independent - no build process needed
- All styles are inline - no external CSS files required
- All JavaScript is inline - no external JS files required
- Works in any modern browser
- Fully responsive and mobile-friendly









