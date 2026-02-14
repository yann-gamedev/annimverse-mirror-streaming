# Development Mode Instructions

## Service Worker Development Mode

The service worker is currently set to **DEVELOPMENT MODE** to allow normal development and testing without aggressive caching.

### Current Status
✅ **Dev Mode: ENABLED** - Caching is disabled, all requests go to network

### To Enable Caching (Production Mode)

Edit `public/sw.js`:
```javascript
// Change this line:
const DEV_MODE = true;

// To:
const DEV_MODE = false;
```

Then reload the page and the service worker will update automatically.

### Clearing Service Worker & Cache

If you need to completely reset:

**Option 1: Browser DevTools**
1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Click "Unregister" next to the service worker
4. Go to Application → Cache Storage
5. Delete all caches

**Option 2: Console Command**
```javascript
// Run in browser console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

### Offline Indicator

The offline indicator only appears when you're actually offline. If it's showing incorrectly:

1. Check your actual internet connection
2. The indicator verifies connectivity every 30 seconds
3. It checks if the server at `/api/status` is reachable

## Development Workflow

### Running the Server
```bash
cd c:\Users\Christian\Documents\Public\annimverse\annimverse
node server.js
```

Server will run at: `http://localhost:4000`

### Building CSS (After Tailwind Changes)
```bash
npm run build:css
```

### Watching CSS (Auto-rebuild on changes)
```bash
npm run watch:css
```

## Common Issues

### "Page is stuck offline"
- Service worker dev mode is ON - requests bypass cache
- If still seeing issues, unregister service worker in DevTools

### "Changes not appearing"
- Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear cache in DevTools
- Check if CSS needs rebuilding: `npm run build:css`

### "Service worker not updating"
- Dev mode bypasses caching automatically
- For production: increment CACHE_VERSION in sw.js

## Production Deployment

Before deploying to production:

1. Set `DEV_MODE = false` in `public/sw.js`
2. Rebuild CSS: `npm run build:css`
3. Test offline functionality
4. Verify service worker is caching correctly

---

**Current Mode:** 🔧 DEVELOPMENT (Caching Disabled)
