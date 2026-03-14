# LunaAI API Quick Reference

## Import API Services

```typescript
// Import individual services
import { authApi, userApi, companyApi } from './services/apiService';

// Or import all at once
import api from './services/apiService';
```

## Common Operations

### Authentication
```typescript
// Login
const response = await api.auth.login('username');

// Signup
await api.auth.signup({ username, email, firstname, lastname });
```

### Users
```typescript
// Get all
const users = await api.user.getAll();

// Get by ID
const user = await api.user.getById(123);

// Create
await api.user.create({ username: 'john', email: 'john@example.com' });

// Update
await api.user.update(123, { email: 'newemail@example.com' });

// Delete
await api.user.delete(123);
```

### Companies
```typescript
const companies = await api.company.getAll();
const company = await api.company.getById(1);
await api.company.create({ companyname: 'Acme Corp' });
```

### Sessions
```typescript
await api.usersession.create({
  userid: 123,
  sessiontoken: 'sess_xyz',
  logintime: new Date().toISOString(),
  ipaddress: '192.168.1.1',
  isactive: true,
});
```

### Logs
```typescript
await api.userlog.create({
  userid: 123,
  action: 'LOGIN',
  timestamp: new Date().toISOString(),
  ipaddress: '192.168.1.1',
  modulename: 'Auth',
  severity: 'INFO',
});
```

### Help Tickets
```typescript
await api.userhelp.create({
  userid: 123,
  subject: 'Issue with dashboard',
  description: 'Cannot access reports',
  status: 'Open',
  priority: 'High',
});
```

### Business Units
```typescript
const bus = await api.bu.getAll();
await api.bu.create({ buname: 'Sales', companyid: 1 });
```

### Stores
```typescript
const stores = await api.store.getAll();
await api.store.create({ storename: 'Store #1', companyid: 1 });
```

### Managers
```typescript
const managers = await api.manager.getAll();
await api.manager.create({ firstname: 'Jane', lastname: 'Smith', companyid: 1 });
```

### Regions
```typescript
const regions = await api.region.getAll();
await api.region.create({ regionname: 'Northeast', companyid: 1 });
```

### Roles
```typescript
const roles = await api.role.getAll();
await api.role.create({ rolename: 'Admin', companyid: 1 });
```

### AI Agents
```typescript
const agents = await api.aiagent.getAll();
await api.aiagent.create({ description: 'AI Agent 1', agenttype: 'LLM' });
```

### Voice Commands
```typescript
await api.voicecommands.create({
  command: 'create report',
  userid: 123,
  timestamp: new Date().toISOString(),
});
```

### AI Actions
```typescript
// Process voice command
await api.aiactions.processVoiceCommand('create_report');

// Get status
const status = await api.aiactions.getStatus('map_123');
```

### Batches
```typescript
await api.batch.create({
  batchname: 'Monthly Reports',
  status: 'Pending',
  userid: 123,
});
```

### Activity Details
```typescript
await api.activitydetail.create({
  description: 'Training completed',
  category: 'Training',
  status: 'Done',
  userid: 123,
});
```

### AdBase (Marketing Campaigns)
```typescript
// Get all campaigns
const campaigns = await api.addbase.getAll();

// Create campaign
await api.addbase.create({
  addid: 'AD-2026-001',
  clientid: 'CL-001',
  mktgurl: 'https://luna.capitoltechnology.net/campaign/spring2026',
  origplatform: 'Google Ads',
  targetplatform: 'Mobile Web',
  cost: 250.50,
  price: 500.00,
  discount: 50.00,
  ulat: '38.9072',
  ulong: '-77.0369',
});
```

### Timesheets
```typescript
await api.timesheet.create({
  employeeid: 123,
  date: '2026-03-14',
  hoursworked: 8,
  status: 'Submitted',
});
```

### Web Search
```typescript
await api.websearch.create({
  searchquery: 'AI best practices',
  userid: 123,
  timestamp: new Date().toISOString(),
});
```

## API Configuration

```typescript
// Located in /src/app/config/api.ts
API_CONFIG = {
  DEV_MODE: true,  // Enable local JSON fallback
  ROOT_URL: 'https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net',
  BASE_PATH: '/api',
}
```

## TypeScript Types

```typescript
import type {
  User,
  Company,
  Employee,
  Usersession,
  Userlog,
  Userhelp,
  Bu,
  Region,
  Manager,
  Store,
  Role,
} from './types/api';
```

## Error Handling

```typescript
try {
  const users = await api.user.getAll();
} catch (error) {
  console.error('API Error:', error);
  // In DEV_MODE, automatically falls back to local JSON
}
```

## All Available Services

- `api.auth` - Authentication
- `api.user` - Users
- `api.company` - Companies
- `api.employee` - Employees
- `api.usersession` - User sessions
- `api.userlog` - User logs
- `api.userhelp` - Help tickets
- `api.websearch` - Web searches
- `api.bu` - Business units
- `api.region` - Regions
- `api.manager` - Managers
- `api.role` - Roles
- `api.store` - Stores
- `api.instance` - Instances
- `api.companyevent` - Company events
- `api.aiagent` - AI agents
- `api.voicecommands` - Voice commands
- `api.aiactions` - AI actions
- `api.batch` - Batches
- `api.batchtype` - Batch types
- `api.batchTranscription` - Batch transcription
- `api.activitydetail` - Activity details
- `api.addbase` - Marketing campaigns (AdBase)
- `api.timesheet` - Timesheets
- `api.usergroups` - User groups

## Common Patterns

### Full Login Flow
```typescript
// 1. Authenticate
const response = await api.auth.login('username');

// 2. Store credentials
localStorage.setItem('uid', response.user.id.toString());

// 3. Create session (exclude 'id' - auto-generated by MSSQL)
await api.usersession.create({
  userid: response.user.id,
  sessiontoken: 'sess_' + Date.now(),
  logintime: new Date().toISOString(),
  isactive: true,
});

// 4. Log the action (exclude 'id' - auto-generated by MSSQL)
await api.userlog.create({
  userid: response.user.id,
  action: 'LOGIN',
  timestamp: new Date().toISOString(),
});
```

### CRUD Pattern
```typescript
// GET all
const items = await api.entity.getAll();

// GET by ID
const item = await api.entity.getById(123);

// POST (create) - NEVER include 'id' (MSSQL auto-generates)
const { id, ...createData } = formData;
await api.entity.create(createData);

// PUT (update) - ID goes in URL, not body
const { id, ...updateData } = formData;
await api.entity.update(id, updateData);

// DELETE - ID in URL
await api.entity.delete(123);
```

## Important Notes

### MSSQL Auto-Generated IDs
⚠️ **CRITICAL**: The API runs on MSSQL Server with auto-generated identity columns.

**DO NOT** include `id` fields in POST requests:
```typescript
// ❌ WRONG - Will fail or be ignored
await api.user.create({
  id: 123,  // Don't include this!
  username: 'john',
  email: 'john@example.com',
});

// ✅ CORRECT - Exclude id, let MSSQL generate it
await api.user.create({
  username: 'john',
  email: 'john@example.com',
});

// ✅ CORRECT - Destructure to exclude id
const { id, ...createData } = formData;
await api.user.create(createData);
```

**DO** include `id` in PUT and DELETE (via URL):
```typescript
// ✅ CORRECT - ID in URL path
await api.user.update(123, { email: 'new@example.com' });
await api.user.delete(123);
```

### Filtering by Foreign Keys

Many API queries filter by `userid`, `companyid`, and other foreign keys:

```typescript
// Get user's sessions
const allSessions = await api.usersession.getAll();
const userSessions = allSessions.filter(s => s.userid === 42);

// Get company's employees
const allEmployees = await api.employee.getAll();
const companyEmployees = allEmployees.filter(e => e.companyid === 5);

// Get user's logs
const allLogs = await api.userlog.getAll();
const userLogs = allLogs.filter(log => log.userid === 42);

// Get user's help tickets
const allTickets = await api.userhelp.getAll();
const userTickets = allTickets.filter(t => t.userid === 42);
```

### Typical Workflow: Retrieve → Use ID → Update

```typescript
// 1. Retrieve records (includes auto-generated IDs)
const campaigns = await api.addbase.getAll();

// 2. Select a specific campaign by its ID
const campaign = campaigns.find(c => c.clientid === 'CL-001');
console.log('Campaign ID:', campaign.id);  // e.g., 147 (auto-generated)

// 3. Update using the ID from step 1
await api.addbase.update(campaign.id, {
  cost: 350.00,
  price: 700.00,
});

// 4. Delete using the ID
await api.addbase.delete(campaign.id);
```