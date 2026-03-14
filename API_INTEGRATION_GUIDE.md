# LunaAI API Integration Guide

## Overview

This document describes the complete API integration for LunaAI based on the Swagger definition (v6.06) from the Azure API at `https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net`.

## Quick Start

### Using the API Service

```typescript
import api from './services/apiService';

// Login
const response = await api.auth.login('username');

// Get all users
const users = await api.user.getAll();

// Get user by ID
const user = await api.user.getById(123);

// Create a company
await api.company.create({ companyname: 'Acme Corp' });
```

## Architecture

### File Structure

```
/src/app/
├── types/
│   └── api.ts              # TypeScript types from Swagger schemas
├── config/
│   └── api.ts              # API configuration and endpoints
├── services/
│   ├── apiService.ts       # Main API service layer
│   └── dataService.ts      # Data service with fallback logic
└── components/
    └── Login.tsx           # Example: Authentication flow
```

### API Configuration (`/src/app/config/api.ts`)

**Base Configuration:**
```typescript
API_CONFIG = {
  DEV_MODE: true,  // Enable fallback to local JSON
  ROOT_URL: 'https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net',
  BASE_PATH: '/api',
}
```

**Endpoints:**
All endpoints are defined in `API_CONFIG.ENDPOINTS` and match the Swagger definition exactly.

## API Endpoints Reference

### Authentication APIs (`/api/Auth`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/Auth/login` | POST | Login with username (password-less) |
| `/api/Auth/loginLocal` | POST | Login with local fallback |
| `/api/Auth/signup` | POST | Register new user |
| `/api/Auth/signupLocal` | POST | Register with local fallback |
| `/api/Auth/forgotPassword` | POST | Request password reset |
| `/api/Auth/resetPassword` | POST | Reset password with token |

**Usage Example:**
```typescript
import { authApi } from './services/apiService';

const response = await authApi.login('john');
// Returns: { success: boolean, user: User, token: string, message: string }
```

### User Management APIs (`/api/Users`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/Users` | GET | Get all users |
| `/api/Users` | POST | Create new user |
| `/api/Users/{id}` | GET | Get user by ID |
| `/api/Users/{id}` | PUT | Update user |
| `/api/Users/{id}` | DELETE | Delete user |
| `/api/Users/logout/{token}` | PUT | Logout user |
| `/api/Users/userjoin` | GET | Get user join data |

**Usage Example:**
```typescript
import { userApi } from './services/apiService';

// Get all users
const users = await userApi.getAll();

// Get specific user
const user = await userApi.getById(123);

// Create user
await userApi.create({
  username: 'john',
  email: 'john@example.com',
  firstname: 'John',
  lastname: 'Doe',
});

// Update user
await userApi.update(123, { email: 'newemail@example.com' });

// Delete user
await userApi.delete(123);
```

### Company Management APIs (`/api/Company`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/Company` | GET | Get all companies |
| `/api/Company` | POST | Create company |
| `/api/Company/{id}` | GET | Get company by ID |
| `/api/Company/{id}` | PUT | Update company |
| `/api/Company/{id}` | DELETE | Delete company |

**Usage Example:**
```typescript
import { companyApi } from './services/apiService';

const companies = await companyApi.getAll();
const company = await companyApi.getById(1);
```

### Session Management APIs (`/api/Usersession`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/Usersession` | GET | Get all sessions |
| `/api/Usersession` | POST | Create session |
| `/api/Usersession/{id}` | GET | Get session by ID |
| `/api/Usersession/{id}` | PUT | Update session |
| `/api/Usersession/{id}` | DELETE | Delete session |

**Usage Example:**
```typescript
import { usersessionApi } from './services/apiService';

await usersessionApi.create({
  userid: 123,
  sessiontoken: 'sess_abc123',
  logintime: new Date().toISOString(),
  ipaddress: '192.168.1.1',
  latitude: '38.9072',
  longitude: '-77.0369',
  isactive: true,
});
```

### Logging APIs (`/api/Userlog`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/Userlog` | GET | Get all logs |
| `/api/Userlog` | POST | Create log entry |
| `/api/Userlog/{id}` | GET | Get log by ID |
| `/api/Userlog/{id}` | PUT | Update log |
| `/api/Userlog/{id}` | DELETE | Delete log |

**Usage Example:**
```typescript
import { userlogApi } from './services/apiService';

await userlogApi.create({
  userid: 123,
  action: 'LOGIN',
  timestamp: new Date().toISOString(),
  ipaddress: '192.168.1.1',
  details: 'User logged in successfully',
  modulename: 'Authentication',
  severity: 'INFO',
});
```

### Help Desk APIs (`/api/Userhelp`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/Userhelp` | GET | Get all tickets |
| `/api/Userhelp` | POST | Create ticket |
| `/api/Userhelp/{id}` | GET | Get ticket by ID |
| `/api/Userhelp/{id}` | PUT | Update ticket |
| `/api/Userhelp/{id}` | DELETE | Delete ticket |

**Usage Example:**
```typescript
import { userhelpApi } from './services/apiService';

await userhelpApi.create({
  userid: 123,
  subject: 'Unable to access dashboard',
  description: 'Getting 404 error when clicking Dashboard',
  status: 'Open',
  priority: 'High',
  category: 'Technical',
});
```

### Management APIs

#### Business Units (`/api/Bu`)
```typescript
import { buApi } from './services/apiService';

await buApi.create({
  buname: 'Sales Department',
  companyid: 1,
  description: 'Sales and marketing division',
});
```

#### Regions (`/api/Region`)
```typescript
import { regionApi } from './services/apiService';

await regionApi.create({
  regionname: 'Northeast',
  companyid: 1,
  description: 'Northeast regional office',
});
```

#### Stores (`/api/Store`)
```typescript
import { storeApi } from './services/apiService';

await storeApi.create({
  storename: 'Store #1234',
  storenumber: '1234',
  companyid: 1,
  city: 'New York',
  state: 'NY',
});
```

#### Managers (`/api/Manager`)
```typescript
import { managerApi } from './services/apiService';

await managerApi.create({
  firstname: 'Jane',
  lastname: 'Smith',
  email: 'jane.smith@company.com',
  companyid: 1,
});
```

#### Roles (`/api/Role`)
```typescript
import { roleApi } from './services/apiService';

await roleApi.create({
  rolename: 'Administrator',
  description: 'Full system access',
  companyid: 1,
});
```

### AI & Processing APIs

#### AI Agents (`/api/Aiagent`)
```typescript
import { aiagentApi } from './services/apiService';

await aiagentApi.create({
  ipprimary: '192.168.1.100',
  description: 'Primary AI processing agent',
  agenttype: 'LLM',
});
```

#### Voice Commands (`/api/Voicecommands`)
```typescript
import { voicecommandsApi } from './services/apiService';

await voicecommandsApi.create({
  command: 'Create new report',
  userid: 123,
  timestamp: new Date().toISOString(),
});
```

#### AI Actions (`/api/aiactions`)
```typescript
import { aiactionsApi } from './services/apiService';

// Process voice command
await aiactionsApi.processVoiceCommand('create_report');

// Check status
const status = await aiactionsApi.getStatus('map_123');
```

#### Batch Processing (`/api/Batch`)
```typescript
import { batchApi } from './services/apiService';

await batchApi.create({
  batchname: 'Monthly Reports',
  batchtype: 1,
  status: 'Pending',
  userid: 123,
});
```

#### Batch Transcription (`/api/BatchTranscription`)
```typescript
import { batchTranscriptionApi } from './services/apiService';

// Upload file
const formData = new FormData();
formData.append('file', file);
await batchTranscriptionApi.upload(formData);

// Run transcription
await batchTranscriptionApi.run({ batchId: 123 });
```

### Activity & Tracking APIs

#### Activity Details (`/api/Activitydetail`)
```typescript
import { activitydetailApi } from './services/apiService';

await activitydetailApi.create({
  description: 'Completed training course',
  category: 'Training',
  startdate: '2026-03-01',
  enddate: '2026-03-14',
  status: 'Completed',
  userid: 123,
});
```

#### AdBase - Marketing Campaigns (`/api/Addbase`)
```typescript
import { addbaseApi } from './services/apiService';

// Create advertising campaign
await addbaseApi.create({
  addid: 'AD-2026-001',
  clientid: 'CL-001',
  mktgurl: 'https://luna.capitoltechnology.net/campaign/spring2026',
  origplatform: 'Google Ads',
  targetplatform: 'Mobile Web',
  sourceip: '192.168.1.100',
  destinationip: '104.26.10.78',
  cost: 250.50,
  price: 500.00,
  discount: 50.00,
  ulat: '38.9072',
  ulong: '-77.0369',
});

// Get all campaigns
const campaigns = await addbaseApi.getAll();

// Track campaign ROI
const campaign = campaigns[0];
const roi = ((campaign.price - campaign.cost) / campaign.cost) * 100;
console.log(`Campaign ROI: ${roi.toFixed(1)}%`);
```

#### Timesheets (`/api/Timesheet`)
```typescript
import { timesheetApi } from './services/apiService';

await timesheetApi.create({
  employeeid: 123,
  date: '2026-03-14',
  hoursworked: 8,
  taskdescription: 'Development work',
  status: 'Submitted',
});
```

#### Web Search (`/api/Websearch`)
```typescript
import { websearchApi } from './services/apiService';

await websearchApi.create({
  searchquery: 'AI best practices',
  userid: 123,
  timestamp: new Date().toISOString(),
  source: 'Internal Knowledge Base',
});
```

## TypeScript Types

All types are defined in `/src/app/types/api.ts` based on the Swagger schemas:

```typescript
import type { User, Company, Employee, LoginRequest } from './types/api';

// All properties match the Swagger definition
const user: User = {
  id: 123,
  username: 'john',
  firstname: 'John',
  lastname: 'Doe',
  email: 'john@example.com',
  role: 'admin',
  companyid: 1,
};
```

## Error Handling

The API service automatically handles errors and provides fallback in DEV_MODE:

```typescript
try {
  const users = await userApi.getAll();
} catch (error) {
  // In DEV_MODE, automatically falls back to local JSON
  console.error('API Error:', error);
}
```

### Development Mode vs Production

**Development Mode (`DEV_MODE: true`):**
- Attempts API calls first
- Falls back to local JSON if API is unreachable
- Logs warnings about API failures
- Useful for development when API might be IP-restricted

**Production Mode (`DEV_MODE: false`):**
- Requires API connectivity
- No fallback to local JSON
- Throws errors if API is unreachable
- Used in production deployment

## Authentication Flow

### Current Implementation (Username-only)

```typescript
import { authApi } from './services/apiService';

// 1. Try local JSON first (for superusers)
const localUser = await checkLocalJSON(username);

if (localUser) {
  // Use local authentication
  localStorage.setItem('uid', localUser.uid);
  // Create session in API
  await usersessionApi.create({...});
} else {
  // 2. Try API authentication
  const response = await authApi.login(username);
  
  if (response.success) {
    localStorage.setItem('uid', response.user.id);
    localStorage.setItem('authToken', response.token);
  }
}

// 3. Log the login
await userlogApi.create({
  userid: userId,
  action: 'LOGIN',
  timestamp: new Date().toISOString(),
});
```

## Migration from Local JSON

To migrate a component from local JSON to the API:

### Before (using local JSON):
```typescript
import usersData from '../data/users.json';

const users = usersData.filter(u => u.companyId === companyId);
```

### After (using API):
```typescript
import { userApi } from '../services/apiService';

const allUsers = await userApi.getAll();
const users = allUsers.filter(u => u.companyid === companyId);
```

## Complete Example: Login with Session Creation

```typescript
import { authApi, usersessionApi, userlogApi } from '../services/apiService';

async function handleLogin(username: string) {
  try {
    // 1. Authenticate
    const loginResponse = await authApi.login(username);
    
    if (!loginResponse.success) {
      throw new Error('Invalid credentials');
    }
    
    // 2. Store credentials
    localStorage.setItem('uid', loginResponse.user.id.toString());
    localStorage.setItem('username', loginResponse.user.username);
    localStorage.setItem('role', loginResponse.user.role);
    
    // 3. Get geolocation
    const position = await getCurrentPosition();
    const latitude = position.coords.latitude.toString();
    const longitude = position.coords.longitude.toString();
    
    // 4. Get IP address
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipResponse.json();
    
    // 5. Create session
    await usersessionApi.create({
      userid: loginResponse.user.id,
      sessiontoken: generateSessionToken(),
      logintime: new Date().toISOString(),
      ipaddress: ip,
      latitude,
      longitude,
      isactive: true,
    });
    
    // 6. Log the action
    await userlogApi.create({
      userid: loginResponse.user.id,
      action: 'LOGIN',
      timestamp: new Date().toISOString(),
      ipaddress: ip,
      details: `Login from ${ip} at ${latitude}, ${longitude}`,
      modulename: 'Authentication',
      severity: 'INFO',
    });
    
    // 7. Navigate to home
    navigate('/');
    
  } catch (error) {
    console.error('Login failed:', error);
    setError('Invalid credentials');
  }
}
```

## API Service Index

Import all services at once:

```typescript
import api from './services/apiService';

// Use any service
await api.auth.login('john');
await api.user.getAll();
await api.company.getById(1);
await api.usersession.create({...});
await api.userlog.create({...});
await api.userhelp.create({...});
```

## Swagger Definition

The complete Swagger definition is available at:
- **Local File:** `/src/imports/swagger.json`
- **Live API:** `https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net/swagger/v1/swagger.json` (requires basic auth: admin/spirit)

## Next Steps

1. **Update existing components** to use the new API service
2. **Test API connectivity** with your IP address whitelisted
3. **Implement error boundaries** for API failures
4. **Add loading states** for async API calls
5. **Create data synchronization** between local JSON and API

## Support

For API access issues:
- Check if your IP is whitelisted in Azure
- Verify `DEV_MODE` is enabled for local development
- Check browser console for detailed error messages
- Review network tab for failed requests

## Important Notes

### Database IDs
- **MSSQL Auto-Generated IDs**: The API runs on MSSQL Server with auto-generated identity columns
- **DO NOT** include `id` fields in POST (create) requests - they will be auto-generated by the database
- **DO** include `id` in PUT (update) and DELETE requests via the URL path parameter
- When creating objects, destructure to exclude the `id`: `const { id, ...createData } = formData;`

### Development Mode
- **DEV_MODE: true**: Enables fallback to local JSON if API is unreachable
- **DEV_MODE: false**: Requires API connectivity, no fallback to local JSON