# LunaAI Static Data Files

This folder contains static JSON data files that are served with the Vite application.

## Files

- **users.json** - User authentication and profile data
- **companies.json** - Company information, branches, business units
- **websearch.json** - Web search query history and responses

## Deployment

When the application is built with Vite, all files in the `/public` folder are copied to the distribution folder root. These JSON files will be accessible at:

- Development: `http://localhost:5173/Data/users.json`
- Production: `https://luna.capitoltechnology.net/Data/users.json`

## Fallback Strategy

The application uses a dual-source strategy:

1. **Primary**: Fetches from `/public/Data/` (served as `/Data/` by Vite)
2. **Fallback**: Uses bundled JSON from `/src/app/data/` if public files are unavailable

This ensures the application works even if the public files are missing or inaccessible.

## Configuration

Data URLs are configured in `/src/app/config/dataUrls.ts`:

```typescript
export const DATA_URLS = {
  USERS: "/Data/users.json",
  COMPANIES: "/Data/companies.json",
  WEBSEARCH: "/Data/websearch.json",
}
```

## For Superusers

Superusers and companies can use these local JSON files as fallback when APIs are unavailable. The application will automatically fall back to these files if API requests fail.

## Updating Data

To update the data:

1. Edit the JSON files in this folder (`/public/Data/`)
2. Also update the fallback files in `/src/app/data/` to keep them in sync
3. Rebuild the application for production deployment

## Notes

- JSON files must be valid JSON format
- Keep file sizes reasonable for web delivery
- Sensitive data should use API endpoints with authentication, not public JSON files
