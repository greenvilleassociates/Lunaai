# Role-Based Navigation Implementation

## Overview
Implemented role-based navigation system that shows different menu items based on user roles, and added the new "Empowr for Enterprise Queries" feature.

## User Roles

### Regular Users (role === "user")
**Visible Navigation Items:**
- My Desktop
- Features
- Visualizations
- Empowr for Enterprise Queries
- Settings (simplified ChatGPT view)

**Hidden Navigation Items:**
- Administrator
- HR Manager
- Luna Modules
- Luna AdBase Pro
- Security(9)
- Grid Licenses
- SuperLuna

### Managers (role === "admin" or role === "superuser")
**All navigation items are visible**, including:
- All regular user items
- Administrator
- HR Manager
- Luna Modules
- Luna AdBase Pro
- Security(9)
- Grid Licenses
- SuperLuna
- Settings (full advanced configuration)

## Changes Made

### 1. Root.tsx (Navigation Component)
**File:** `/src/app/components/Root.tsx`

**Key Changes:**
- Added `isManager` constant: `const isManager = isSuperUser || isAdmin;`
- Wrapped manager-only navigation items with `{isManager && ( ... )}`
- Made Settings visible to ALL users (previously only superusers)
- Added new "Empowr for Enterprise Queries" navigation item
- Applied role-based visibility across all three navigation modes:
  - Desktop sidebar (large screens)
  - Hamburger dropdown menu (medium screens)
  - Mobile drawer (screens ≤1000px)

### 2. Settings.tsx (Settings Page Component)
**File:** `/src/app/components/Settings.tsx`

**Key Changes:**
- Added `isManager` check: `const isManager = isSuperUser || currentUserRole === "admin";`
- Created simplified view for non-managers showing:
  - ChatGPT as default AI provider
  - GPT-4 model version
  - Active status indicator
  - Message directing users to contact administrator for advanced options
- Kept full settings tabs for managers:
  - LLM Agents
  - API Configuration
  - Security & Auth
  - System Settings
  - Custom SLM
  - Utilities

### 3. Empowr Component (NEW)
**File:** `/src/app/components/Empowr.tsx`

**Features:**
- AI-powered enterprise search interface
- Natural language query input
- Mock search results with relevance scoring
- Example queries for quick access
- Category-based result filtering
- Feature cards highlighting AI capabilities
- Uses Material-UI components with CTS brand colors (#8B0000)
- Powered by ChatGPT for intelligent search

### 4. Routes Configuration
**File:** `/src/app/routes.tsx`

**Changes:**
- Added import for Empowr component
- Added route: `{ path: "empowr", element: <ProtectedRoute><Empowr /></ProtectedRoute> }`

## Navigation Structure

### For Non-Managers
```
Top Navigation:
├── My Desktop
├── Features
├── Visualizations
├── Empowr
└── Settings (simplified)
```

### For Managers
```
Top Navigation:
├── My Desktop
├── Features
├── Visualizations
├── Empowr
├── Settings (full)
├── Administrator
├── HR Manager
├── Luna Modules
├── Luna AdBase Pro
├── Security(9)
├── Grid Licenses
└── SuperLuna
```

## Implementation Details

### Role Detection
```typescript
const currentUserRole = localStorage.getItem("role");
const isSuperUser = currentUserRole === "superuser";
const isAdmin = currentUserRole === "admin";
const isManager = isSuperUser || isAdmin;
```

### Conditional Rendering Pattern
```typescript
{isManager && (
  <Link to="/administrator">
    <AdminPanelSettingsIcon />
    <span>Administrator</span>
  </Link>
)}
```

## Testing

### Test Accounts (from users.json)
1. **Regular User:**
   - Username: `marco`
   - Password: `test12345`
   - Role: `user`
   - Should see: Desktop, Features, Visualizations, Empowr, Settings (simplified)

2. **Admin User:**
   - Username: `brian`
   - Password: `test12345`
   - Role: `admin`
   - Should see: All navigation items

3. **Superuser:**
   - Username: `john`
   - Password: `test12345`
   - Role: `superuser`
   - Should see: All navigation items

## Benefits

1. **Improved UX:** Regular users see a cleaner, focused interface without overwhelming admin options
2. **Security:** Reduces visibility of administrative functions to unauthorized users
3. **Scalability:** Easy to add more role-based features in the future
4. **Consistency:** Role checks applied consistently across all navigation views
5. **Mobile-Friendly:** Role-based navigation works seamlessly on mobile devices

## Future Enhancements

Potential improvements:
- Add more granular roles (e.g., "manager", "viewer", "contributor")
- Implement permission-based access control at the API level
- Add role management UI for administrators
- Create role-specific dashboards
- Add audit logging for role-based access

## Notes

- Settings page now accessible to all users, but shows different content based on role
- Empowr is available to all authenticated users
- Manager-only items are completely hidden from non-managers (not just disabled)
- All role checks use the same pattern for consistency
- Changes are backward compatible with existing superuser and admin roles
