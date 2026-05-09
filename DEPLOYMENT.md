# LunaAI Deployment Guide

## Overview
This guide covers deploying the LunaAI React application to luna.capitoltechnology.net with proper integration to the Azure API backend.

## Prerequisites
- Node.js 24.x installed
- pnpm or yarn package manager
- Access to luna.capitoltechnology.net server
- Azure API running at: `lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net`

## Local Development

### 1. Install Dependencies
```bash
# Using pnpm (recommended)
pnpm install

# Or using yarn
yarn install
```

### 2. Run Development Server
```bash
pnpm dev
# or
yarn dev
```

The application will run on `http://localhost:5173`

## Building for Production

### 1. Build the Application
```bash
pnpm build
# or
yarn build
```

This creates an optimized production build in the `dist/` directory.

### 2. Preview Production Build Locally
```bash
pnpm preview
# or
yarn preview
```

## Deployment to luna.capitoltechnology.net

### Option 1: Manual Deployment

1. **Build the application locally:**
   ```bash
   pnpm build
   ```

2. **Upload the `dist/` folder contents** to your web server:
   - Upload all files from `dist/` to your web root directory
   - Ensure proper permissions are set

3. **Configure Web Server:**
   - For **Apache**, add this to `.htaccess` in the root directory:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```
   
   - For **Nginx**, add this to your server configuration:
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

### Option 2: GitHub Actions CI/CD (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '24'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm build
        
      - name: Deploy to Server
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: luna.capitoltechnology.net
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./dist/
          server-dir: /public_html/
```

## Important Notes

### Authentication
- **Local Development**: Uses local JSON files (`/src/app/data/users.json`) as fallback
- **Production**: Attempts Azure API first, falls back to local JSON if API fails
  - Primary Login: `POST /api/Auth/login` with `{ "username": "string", "plainPassword": "string" }`
  - Signup: `POST /api/Auth/signup`
- **Dual Mode**: App tries Azure API first, then falls back to hardcoded users for resilience

### Authentication Flow
1. **Azure API Auth** (Primary):
   - POST `/api/Auth/login` with `{ username, plainPassword }`
   - Returns: `{ user: {...}, token: "..." }`
   - Session is created automatically server-side
   - Stores: `authToken`, `uid`, `username`, `role` in localStorage
   
2. **Local JSON Auth** (Fallback):
   - Validates against `/src/app/data/users.json`
   - If valid, POSTs session to `/api/Usersession` to create server-side session
   - Stores: `uid`, `username`, `role`, `sessionToken` in localStorage
   
3. **Both Methods**:
   - Capture geolocation (latitude, longitude)
   - Capture IP address via ipify.org
   - Log login event to `/api/Userlog`
   - Store login metadata in localStorage

### API Configuration
All API endpoints are configured in `/src/app/config/api.ts`:
- Base URL: `https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net/api`
- Endpoints include user management, authentication, company management, and more

### CORS Configuration
Ensure your Azure API allows requests from:
- `https://luna.capitoltechnology.net`
- `http://localhost:5173` (for development)

Add these CORS headers on your Azure API:
```
Access-Control-Allow-Origin: https://luna.capitoltechnology.net
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Environment Variables (Optional)
If you need to use different API endpoints for dev/prod, create:

**`.env.development`:**
```
VITE_API_URL=http://localhost:3000/api
```

**`.env.production`:**
```
VITE_API_URL=https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net/api
```

Then update `/src/app/config/api.ts` to use:
```typescript
ROOT_URL: import.meta.env.VITE_API_URL || 'https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net'
```

## Testing the Deployment

### 1. Test Authentication
- Navigate to `https://luna.capitoltechnology.net/login`
- Try logging in with test credentials
- Check browser console for any API errors

### 2. Test Registration
- Navigate to `https://luna.capitoltechnology.net/register`
- Register a new user
- Verify the user is created in Azure database

### 3. Check Network Requests
- Open browser DevTools → Network tab
- Monitor API calls to ensure they're hitting the correct endpoints
- Look for CORS errors or 4xx/5xx status codes

## Troubleshooting

### Issue: Login not working
**Solution:** 
- Check that Azure API `/api/auth/login` endpoint is accessible
- Verify CORS headers are set correctly
- Check browser console for error messages

### Issue: 404 errors on page refresh
**Solution:**
- Ensure web server is configured for SPA routing (see "Configure Web Server" above)
- Check that `.htaccess` (Apache) or nginx config is properly set

### Issue: API requests failing
**Solution:**
- Verify Azure API is running: `curl https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net/api/health`
- Check that API endpoints match in `/src/app/config/api.ts`
- Enable verbose logging in browser DevTools

### Issue: Static assets not loading
**Solution:**
- Ensure all files from `dist/` are uploaded
- Check file permissions on server
- Verify base path in `vite.config.ts` if app is not at domain root

## Post-Deployment Checklist

- [ ] Application loads at `https://luna.capitoltechnology.net`
- [ ] Login functionality works with Azure API
- [ ] Registration creates users in Azure database
- [ ] All routes work (no 404s on refresh)
- [ ] Static assets (images, CSS, JS) load correctly
- [ ] API calls succeed (check Network tab)
- [ ] HTTPS is properly configured
- [ ] Error logging is set up (optional)

## Support
For issues or questions, contact Capitol Technology Solutions support team.