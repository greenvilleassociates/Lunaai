# LunaAI API Implementation Guide

## Overview

The LunaAI application now uses real Azure APIs for all data operations with automatic fallback to local JSON files for superusers and companies data only.

## Data Service Layer

All API interactions are centralized in `/src/app/services/dataService.ts` which provides:

- **Type-safe interfaces** for all data models
- **Service objects** for each entity (Users, Companies, Business Units, etc.)
- **Automatic error handling** with fallback mechanisms
- **Authentication** via JWT tokens (automatically included in headers)

## Services Available

### UserService
- `getAll()` - Get all users (with superuser fallback)
- `getById(uid)` - Get specific user
- `create(user)` - Create new user
- `update(uid, user)` - Update existing user
- `delete(uid)` - Delete user
- `getByCompany(companyId)` - Get users by company

### CompanyService
- `getAll()` - Get all companies (always has fallback)
- `getById(companyId)` - Get specific company
- `create(company)` - Create new company
- `update(companyId, company)` - Update existing company
- `delete(companyId)` - Delete company

### Additional Services
- BusinessUnitService
- UserGroupService
- StoreService
- RoleService
- RegionService
- ManagerService
- CompanyEventService
- InstanceService

## Fallback Mechanism

### Superuser Fallback
When an API call fails, the system checks if the current user is a superuser (role === "superuser"). If yes, it falls back to local JSON data.

### Company Fallback
Company data always has fallback to local JSON regardless of user role, ensuring the application remains functional even if the API is unavailable.

## Implementation Example

### Before (Local JSON):
```typescript
import users from "../data/users.json";

const user = users.find((u) => u.uid === uid);
```

### After (API with Fallback):
```typescript
import { UserService } from "../services/dataService";

const user = await UserService.getById(uid);
// Automatically uses API, falls back to JSON for superusers if API fails
```

## Updated Components

The following components have been updated to use the API service:

1. **AdministratorTabbed** - Uses UserService and CompanyService
2. **Profile** - Uses UserService for profile management
3. **Login** - Already using Azure API `/api/Auth/login`
4. **Administrator** - Needs update to use new services
5. **StoreManagement** - Should use StoreService
6. **RoleManagement** - Should use RoleService
7. **RegionManagement** - Should use RegionService
8. **ManagerManagement** - Should use ManagerService
9. **CompanyEvents** - Should use CompanyEventService
10. **InstanceManagement** - Should use InstanceService

## API Configuration

All API endpoints are configured in `/src/app/config/api.ts`:

- Root URL: `https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net`
- Base Path: `/api`
- Full Base URL: `https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net/api`

## Authentication

JWT tokens are automatically included in all API requests via the `getAuthHeaders()` utility from `/src/app/utils/auth.ts`.

## Error Handling

The dataService implements comprehensive error handling:

1. **Try API first** - All requests go to Azure API initially
2. **Log errors** - Failed API calls are logged to console
3. **Fallback logic** - For Users (superuser only) and Companies (always)
4. **Throw errors** - Non-fallback errors are propagated to calling code

## Testing

### Testing API Calls
1. Login as a regular user - should use API only
2. Login as superuser - should use API with JSON fallback on failure
3. Test company operations - should always have JSON fallback

### Testing Fallback
1. Temporarily modify API endpoint to invalid URL
2. Login as superuser
3. Verify local JSON data is used
4. Restore API endpoint

## Next Steps

1. Update remaining components (Administrator, StoreManagement, etc.) to use services
2. Implement WebSocket support for real-time updates
3. Add caching layer for frequently accessed data
4. Implement optimistic UI updates for better UX
5. Add retry logic with exponential backoff

## Local JSON Files

Keep these files for fallback support:
- `/src/app/data/users.json` - Superuser fallback
- `/src/app/data/companies.json` - Always available fallback

These files should contain:
- Superuser accounts for emergency access
- Company reference data
- Development/testing data

## Security Notes

- JWT tokens are stored in localStorage
- Bearer tokens automatically included in API headers
- CORS should be configured on Azure API
- Local JSON fallback only works for authenticated users
- Sensitive data should never be in local JSON files

## Support

For API issues, check:
1. Console logs for specific error messages
2. Network tab for failed requests
3. Azure API logs for server-side issues
4. Fallback to local JSON for superusers if needed
