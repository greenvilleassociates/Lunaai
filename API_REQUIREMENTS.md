# LunaAI - API Requirements Document
**To:** stritzj@email.sc.edu  
**From:** LunaAI Development Team  
**Date:** March 13, 2026  
**Subject:** Local Data Objects Requiring Azure API Integration

---

## Executive Summary

This document lists all local/mock data objects currently used in the LunaAI application that require Azure API endpoints for full production deployment. The application currently uses localStorage and local JSON files as fallback mechanisms, which need to be replaced or supplemented with proper API integrations.

---

## 1. User Management & Authentication

### 1.1 Users API
**Current State:** Local JSON file (`/src/app/data/users.json`)  
**Fallback:** localStorage for session data

**Required Endpoints:**
- `GET /api/users` - Fetch all users (with company filtering)
- `GET /api/users/{uid}` - Get specific user by UID
- `POST /api/users` - Create new user
- `PUT /api/users/{uid}` - Update user profile
- `DELETE /api/users/{uid}` - Delete user

**Data Structure:**
```typescript
interface User {
  uid: string;
  username: string;
  email?: string;
  role: "user" | "admin" | "manager" | "superuser";
  companyId: string;
  managerId?: string;
  userid?: number; // Numeric user ID
}
```

**Files Using This:**
- `/src/app/components/Login.tsx`
- `/src/app/components/Administrator.tsx`
- `/src/app/components/MyDesktop.tsx`
- `/src/app/components/Profile.tsx`

---

### 1.2 Login Sessions API
**Current State:** localStorage only  
**Required Endpoints:**
- `POST /api/sessions/login` - Create new login session
- `POST /api/sessions/logout` - Mark session as complete
- `GET /api/sessions/{uid}` - Get user session history

**Data Structure:**
```typescript
interface LoginSession {
  sessionToken: string;
  uid: string;
  username: string;
  loginTime: string; // ISO 8601 timestamp
  logoutTime?: string;
  latitude: string;
  longitude: string;
  ipAddress: string;
  userAgent?: string;
  status: "active" | "completed";
}
```

**Files Using This:**
- `/src/app/components/Login.tsx`
- `/src/app/components/Root.tsx`

---

### 1.3 Login Logs API
**Current State:** API exists but needs enhancement  
**Endpoint:** `POST /api/loginlogs`

**Data Structure:**
```typescript
interface LoginLog {
  id?: number;
  uid: string;
  username: string;
  timestamp: string;
  ipaddress: string;
  latitude: string;
  longitude: string;
}
```

**Files Using This:**
- `/src/app/components/Login.tsx`

---

## 2. Company Management

### 2.1 Companies API
**Current State:** Local JSON file (`/src/app/data/companies.json`)

**Required Endpoints:**
- `GET /api/companies` - Fetch all companies
- `GET /api/companies/{companyId}` - Get specific company
- `POST /api/companies` - Create new company
- `PUT /api/companies/{companyId}` - Update company
- `DELETE /api/companies/{companyId}` - Delete company

**Data Structure:**
```typescript
interface Company {
  companyId: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  subscriptionLevel?: string;
  status?: "active" | "inactive";
}
```

**Files Using This:**
- `/src/app/components/Administrator.tsx`
- `/src/app/components/MyDesktop.tsx`

---

### 2.2 Stores API
**Current State:** API exists  
**Endpoint:** `/api/stores`

**Required Operations:**
- `GET /api/stores` - Get all stores
- `GET /api/stores?companyId={companyId}` - Get stores by company
- `POST /api/stores` - Create new store (used for Corporate HQ auto-creation)

**Data Structure:**
```typescript
interface Store {
  storeid: number;
  storename: string;
  companyid: number;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  storeType?: string; // "Corporate HQ", "Retail", etc.
}
```

**Files Using This:**
- `/src/app/components/Administrator.tsx`

---

### 2.3 Business Units API
**Current State:** API exists  
**Endpoint:** `/api/businessunits`

**Required Operations:**
- `GET /api/businessunits` - Get all business units
- `GET /api/businessunits?companyId={companyId}` - Get by company
- `POST /api/businessunits` - Create new business unit

**Data Structure:**
```typescript
interface BusinessUnit {
  businessunitid: number;
  businessunitname: string;
  companyid: number;
  description?: string;
  managerName?: string;
  status?: string;
}
```

**Files Using This:**
- `/src/app/components/Administrator.tsx`

---

## 3. AI Operations & Search

### 3.1 Web Search / AI Text Searches API
**Current State:** Local JSON file (`/src/app/data/websearch.json`)  
**API Exists:** `POST /api/websearch`

**Required Operations:**
- `POST /api/websearch` - Submit new AI search query
- `GET /api/websearch?uid={uid}` - Get searches by user
- `GET /api/websearch?companyId={companyId}` - Get searches by company
- `GET /api/websearch?managerId={managerId}` - Get team searches

**Data Structure:**
```typescript
interface WebSearchResult {
  id?: number;
  uid: string;
  question: string;
  response: string;
  timestamp: string;
  metadata?: string; // JSON string
  expectedtokens?: number;
  expectedcost?: number;
  companyId?: string;
  username?: string;
}
```

**Files Using This:**
- `/src/app/components/Home.tsx`
- `/src/app/components/MyDesktop.tsx`
- `/src/app/components/Visualizations.tsx`

---

### 3.2 Voice Commands API
**Current State:** localStorage fallback  
**API Exists:** `POST /api/voicecommands`, `GET /api/voicecommands`

**Required Operations:**
- `POST /api/voicecommands` - Create voice command
- `GET /api/voicecommands?uid={uid}` - Get by user
- `GET /api/voicecommands?companyId={companyId}` - Get by company
- `PUT /api/voicecommands/{id}` - Update status

**Data Structure:**
```typescript
interface VoiceCommand {
  id: number;
  commandType: string; // "recording" or "upload"
  commandText?: string;
  actionTime: string;
  actionType: number; // 1=pending, 2=processing, 3=complete
  status: string; // "queued", "processing", "completed"
  useridstring?: string; // uid
  userid?: number;
  displayname?: string; // username
  companyId?: string;
}
```

**Files Using This:**
- `/src/app/components/UploadPrompt.tsx`
- `/src/app/components/StartRecording.tsx`
- `/src/app/components/MyDesktop.tsx`
- `/src/app/components/Visualizations.tsx`

---

### 3.3 AI Actions API
**Current State:** API exists but needs enhancement  
**Endpoints:**
- `/api/aiactions` - For text-based AI actions
- `/api/aiactions/voice` - For voice-based AI actions

**Required Operations:**
- `POST /api/aiactions` - Submit text prompt for AI processing
- `POST /api/aiactions/voice` - Submit voice file for AI processing
- `GET /api/aiactions?uid={uid}` - Get actions by user
- `PUT /api/aiactions/{id}` - Update action status

**Data Structure:**
```typescript
interface AIAction {
  id?: number;
  uid: string;
  username: string;
  email: string;
  userid?: number;
  actionType: string; // "text", "voice", "file"
  prompt?: string;
  fileName?: string;
  fileSize?: number;
  status: string; // "pending", "processing", "completed", "failed"
  timestamp: string;
  metadata?: string; // JSON with processing details
  models?: string[]; // ["ChatGPT", "Claude", "Gemini"]
  expectedTokens?: number;
  expectedCost?: number;
}
```

**Files Using This:**
- `/src/app/components/UploadPrompt.tsx`
- `/src/app/components/StartRecording.tsx`

---

## 4. Luna Modules Management

### 4.1 Luna Modules API
**Current State:** localStorage with DEFAULT_MODULES fallback  
**API Expected:** `/api/lunamodules`

**Required Operations:**
- `GET /api/lunamodules` - Get all modules
- `GET /api/lunamodules/{id}` - Get specific module
- `PUT /api/lunamodules/{id}` - Update module configuration
- `PATCH /api/lunamodules/{id}/toggle` - Toggle module active status
- `PATCH /api/lunamodules/{id}/availability` - Toggle availability for sale

**Data Structure:**
```typescript
interface Module {
  id: string;
  name: string;
  vendor: string;
  description: string;
  icon: React.ReactNode; // Stored as icon name string in API
  maxUsers: number;
  currentUsers: number;
  licenseType: "Trial" | "Standard" | "Professional" | "Enterprise" | "Unlimited";
  isActive: boolean;
  availableForSale: boolean;
  expiryDate?: string;
  features: string[];
  serverQuantities?: Array<{
    region: string;
    quantity: number;
    stores: Array<{ name: string; location: string }>;
  }>;
  gridCharges?: Array<{
    region: string;
    chargePerGrid: number;
    stores: Array<{ name: string; location: string }>;
  }>;
  clusterLicenses?: Array<{
    siteName: string;
    nodesPerCluster: number;
    location: string;
  }>;
  remoteAgents?: Array<{
    agentType: string;
    activeAgents: number;
    region: string;
  }>;
  personalCALs?: Array<{
    userName: string;
    email: string;
    accessLevel: string;
  }>;
  hqAccessPoints?: Array<{
    hqSite: string;
    connectorID: string;
    location: string;
    status: string;
  }>;
}
```

**Default Modules Count:** 24 modules including:
- SuperLuna AI Orchestrator (Release 8.0)
- HR Manager
- Fusion Commerce
- PowerPack Warehouse Solution
- Fusion Point-of-Sale
- CTS Grid App License Manager
- Enterprise 9 Security
- And 17 others...

**Files Using This:**
- `/src/app/components/LunaModules.tsx`

---

## 5. Security & Logging

### 5.1 Enterprise 9 Security Logs
**Current State:** Mock data (MOCK_USER_LOGS, MOCK_USER_ACTIONS, etc.)  
**API Expected:** `/api/security/logs`

**Required Operations:**
- `GET /api/security/logs/user` - User login/logout logs
- `GET /api/security/logs/actions` - User action logs
- `GET /api/security/logs/auth` - Authentication notices
- `GET /api/security/logs/sysadmin` - System admin operations
- `POST /api/security/logs` - Create new security log entry

**Data Structure:**
```typescript
interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
  location?: string;
  severity: "success" | "info" | "warning" | "error";
  category: string;
}
```

**Log Categories:**
- User Logs & Logins (Authentication events)
- User Actions (Access and operations)
- Auth Notices & Warnings (Security policy events)
- System Admin Logs (Administrative operations)

**Files Using This:**
- `/src/app/components/Enterprise9Security.tsx`

---

## 6. Team & Manager Relations

### 6.1 Team Members API
**Current State:** Mock data fallback  
**API Expected:** `/api/users/team?managerId={managerId}`

**Required Operations:**
- `GET /api/users/team?managerId={managerId}` - Get team members for a manager
- `GET /api/users/reports?uid={uid}` - Get direct reports

**Notes:**
- Should filter users by `managerId` field
- Used for manager view in MyDesktop

**Files Using This:**
- `/src/app/components/MyDesktop.tsx`

---

## 7. HR Manager (Work Orders)

### 7.1 Work Orders API
**Current State:** Not yet implemented  
**API Expected:** `/api/workorders`

**Required Operations:**
- `GET /api/workorders` - Get all work orders
- `GET /api/workorders?uid={uid}` - Get user's work orders
- `GET /api/workorders?assignedTo={uid}` - Get assigned work orders
- `POST /api/workorders` - Create new work order
- `PUT /api/workorders/{id}` - Update work order
- `PATCH /api/workorders/{id}/status` - Update status

**Data Structure:**
```typescript
interface WorkOrder {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdBy: string; // uid
  assignedTo?: string; // uid
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  companyId: string;
}
```

**Files Using This:**
- `/src/app/components/UserHelp.tsx`

---

## 8. Transactions (Future Enhancement)

### 8.1 Transactions API
**Current State:** Mock data only  
**API Expected:** `/api/transactions`

**Required Operations:**
- `GET /api/transactions?uid={uid}` - Get user transactions
- `GET /api/transactions?companyId={companyId}` - Get company transactions
- `POST /api/transactions` - Create transaction record

**Data Structure:**
```typescript
interface Transaction {
  id: string;
  userId: string;
  username: string;
  amount: number;
  type: string; // "AI Query", "Module License", etc.
  status: string;
  timestamp: string;
  description: string;
  metadata?: string;
}
```

**Files Using This:**
- `/src/app/components/Transactions.tsx`

---

## 9. Configuration & Settings

### 9.1 Module Configuration
**Current State:** localStorage (`lunaModulesConfig`)  
**Should Be:** Synced with `/api/lunamodules`

**Purpose:**
- Store site administrator's module visibility preferences
- Track which modules are available for sale
- Persist module state between sessions

---

### 9.2 User Preferences
**Current State:** localStorage only  
**API Expected:** `/api/users/{uid}/preferences`

**Data Stored:**
- View preferences (personal/team/company)
- Dashboard customization
- Notification settings

---

## 10. Data Synchronization Strategy

### Recommended Approach:

**For Superusers:**
- Allow localStorage fallback for all operations
- Enable offline functionality with sync on reconnect

**For Regular Users:**
- Primary: Azure API
- Fallback: Local JSON files (read-only)
- No localStorage fallback (except session data)

**For Companies:**
- Require API connectivity
- Local JSON as emergency read-only backup

---

## 11. API Endpoints Summary

### User & Authentication
- ✅ `/api/users` - Exists, needs GET enhancement
- ✅ `/api/users/{uid}` - Exists
- ✅ `/api/sessions/login` - Needs creation
- ✅ `/api/sessions/logout` - Needs creation
- ✅ `/api/loginlogs` - Exists

### Company Management
- ✅ `/api/companies` - Exists
- ✅ `/api/stores` - Exists
- ✅ `/api/businessunits` - Exists

### AI Operations
- ✅ `/api/websearch` - Exists
- ✅ `/api/voicecommands` - Exists
- ✅ `/api/aiactions` - Exists
- ✅ `/api/aiactions/voice` - Exists

### Modules & Licensing
- ⚠️ `/api/lunamodules` - Needs creation
- ⚠️ `/api/lunamodules/{id}` - Needs creation
- ⚠️ `/api/lunamodules/{id}/toggle` - Needs creation

### Security & Logging
- ⚠️ `/api/security/logs` - Needs creation
- ⚠️ `/api/security/logs/user` - Needs creation
- ⚠️ `/api/security/logs/actions` - Needs creation
- ⚠️ `/api/security/logs/auth` - Needs creation

### HR & Support
- ⚠️ `/api/workorders` - Needs creation

### Additional
- ⚠️ `/api/transactions` - Future enhancement
- ⚠️ `/api/users/team` - Needs creation
- ⚠️ `/api/users/{uid}/preferences` - Needs creation

---

## 12. Priority Recommendations

### High Priority (Required for Production):
1. **Sessions API** - Proper session management with logout tracking
2. **Luna Modules API** - Complete CRUD operations for module management
3. **Team Members API** - Manager view functionality
4. **Security Logs API** - Enterprise 9 Security compliance

### Medium Priority (Enhanced Functionality):
1. **Work Orders API** - HR Manager work order system
2. **User Preferences API** - Personalization and settings
3. **Enhanced User API** - Full profile management

### Low Priority (Future Features):
1. **Transactions API** - Financial tracking
2. **Analytics API** - Usage statistics and reporting

---

## 13. Local JSON Files Currently in Use

Located in `/src/app/data/`:
1. **users.json** - User accounts and profiles
2. **companies.json** - Company directory
3. **websearch.json** - Historical AI search results

**Recommendation:** Keep these files as read-only fallback for when API is unavailable, but always prioritize API data when available.

---

## 14. localStorage Keys Currently Used

- `uid` - User identifier
- `username` - Display name
- `email` - User email
- `role` - User role
- `companyId` - Company identifier
- `managerId` - Manager identifier (for team hierarchy)
- `userid` - Numeric user ID
- `sessionToken` - Active session token
- `loginTime` - Latest login timestamp
- `latitude` / `longitude` - Login location
- `ipAddress` - Login IP
- `lunaModulesConfig` - Module configuration (site admin only)
- `voiceCommands` - Voice command history (superuser fallback)

---

## 15. Current API Configuration

**Base URL:** `https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net`

**Configuration File:** `/src/app/config/api.ts`

**Headers:**
```typescript
{
  "Content-Type": "application/json",
  "accept": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("uid")}`
}
```

---

## 16. Testing Recommendations

### For Each API Endpoint:
1. Test successful responses
2. Test error handling (404, 500, network errors)
3. Test localStorage fallback behavior
4. Test data synchronization
5. Test offline functionality for superusers

### Data Integrity:
1. Ensure consistent data types between local and API
2. Validate JSON structure matches TypeScript interfaces
3. Test data migrations for existing localStorage data

---

## Questions or Clarifications?

Please contact the LunaAI development team or reply to stritzj@email.sc.edu with any questions about:
- API endpoint specifications
- Data structure requirements
- Authentication/authorization needs
- Deployment timeline
- Integration testing procedures

---

**Document Version:** 1.0  
**Last Updated:** March 13, 2026  
**Azure Deployment:** luna.capitoltechnology.net  
**API Root:** lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net
