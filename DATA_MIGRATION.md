# LunaAI Data Migration - Local JSON Files

## Overview

All local JSON data files have been moved to the `/public/Data/` folder so they will be automatically published with Vite builds and deployments.

## What Changed

### Before
- JSON files were located in `/src/app/data/`
- Files were bundled with the application code
- Not easily accessible for external updates

### After
- JSON files are now in `/public/Data/`
- Files are served as static assets by Vite
- Accessible at `/Data/*.json` URLs
- Automatically deployed with the application

## Files Migrated

| File | Location | URL |
|------|----------|-----|
| users.json | `/public/Data/users.json` | `/Data/users.json` |
| companies.json | `/public/Data/companies.json` | `/Data/companies.json` |
| websearch.json | `/public/Data/websearch.json` | `/Data/websearch.json` |

## Access URLs

### Development
- `http://localhost:5173/Data/users.json`
- `http://localhost:5173/Data/companies.json`
- `http://localhost:5173/Data/websearch.json`

### Production
- `https://luna.capitoltechnology.net/Data/users.json`
- `https://luna.capitoltechnology.net/Data/companies.json`
- `https://luna.capitoltechnology.net/Data/websearch.json`

## Fallback Strategy

The application uses a **dual-source data strategy** for maximum reliability:

```
1. Try /public/Data/ folder (primary)
   ↓ (if fails)
2. Fall back to bundled JSON from /src/app/data/ (secondary)
```

### Code Configuration

Updated `/src/app/config/dataUrls.ts`:

```typescript
// Primary source (public folder)
export const DATA_URLS = {
  USERS: "/Data/users.json",
  COMPANIES: "/Data/companies.json",
  WEBSEARCH: "/Data/websearch.json",
}

// External production URLs
export const EXTERNAL_DATA_URLS = {
  USERS: "https://luna.capitoltechnology.net/Data/users.json",
  COMPANIES: "https://luna.capitoltechnology.net/Data/companies.json",
  WEBSEARCH: "https://luna.capitoltechnology.net/Data/websearch.json",
}

// Fallback imports from src/app/data/
import usersJsonFallback from "../data/users.json";
import companiesJsonFallback from "../data/companies.json";
import websearchJsonFallback from "../data/websearch.json";
```

## Benefits

### 1. **Automatic Deployment**
- Vite automatically copies `/public` folder contents to the build output
- No manual file copying needed during deployment

### 2. **Easy Updates**
- JSON files can be updated directly on the server
- No application rebuild required for data changes
- Superusers can manage data files independently

### 3. **API Fallback Support**
- When APIs are unavailable, app uses public JSON files
- Public JSON files themselves have bundled fallbacks
- Triple-redundancy: API → Public JSON → Bundled JSON

### 4. **Development Flexibility**
- Local development uses `/public/Data/` files
- Production uses same structure
- Consistent behavior across environments

## Deployment Checklist

When deploying to production:

- [x] Ensure `/public/Data/` folder exists
- [x] All JSON files are valid JSON format
- [x] Files have correct permissions (readable)
- [x] Server allows access to `/Data/*.json` URLs
- [x] CORS headers configured if needed

## Superuser Features

Superusers and companies can:

1. **Download local JSON copies** from `/Data/` URLs
2. **Use as API fallback** when Azure APIs are unavailable
3. **Update data files** directly on the server
4. **Maintain data independence** from external APIs

## For Developers

### Updating JSON Files

To keep data synchronized:

1. Update `/public/Data/*.json` (primary)
2. Update `/src/app/data/*.json` (fallback)
3. Rebuild for production: `npm run build`

### Adding New JSON Files

1. Add file to `/public/Data/newfile.json`
2. Add fallback to `/src/app/data/newfile.json`
3. Update `/src/app/config/dataUrls.ts`:
   ```typescript
   export const DATA_URLS = {
     // ... existing
     NEWFILE: "/Data/newfile.json",
   }
   ```
4. Import fallback:
   ```typescript
   import newfileJsonFallback from "../data/newfile.json";
   ```

## Testing

### Test Public Files
```bash
# Start dev server
npm run dev

# Access in browser
http://localhost:5173/Data/users.json
http://localhost:5173/Data/companies.json
http://localhost:5173/Data/websearch.json
```

### Test Fallback
1. Temporarily rename `/public/Data/` to `/public/Data_backup/`
2. Run application - should fall back to bundled JSON
3. Restore `/public/Data/` folder

## Notes

- Keep `/src/app/data/` files as fallback backups
- Don't delete original fallback files
- Public JSON files take precedence over bundled files
- Bundled files are only used if public files fail to load

## Security Considerations

- These are **public files** - anyone can access them
- Don't store sensitive data (passwords, API keys, tokens)
- Use Azure APIs for sensitive operations
- Public JSONs are for **fallback and development only**

## Production URLs

After deployment, verify these URLs work:

- ✅ https://luna.capitoltechnology.net/Data/users.json
- ✅ https://luna.capitoltechnology.net/Data/companies.json
- ✅ https://luna.capitoltechnology.net/Data/websearch.json

---

**Migration Date**: March 13, 2026  
**Status**: ✅ Complete  
**Files Migrated**: 3 (users.json, companies.json, websearch.json)
