/**
 * Data Service for LunaAI
 * 
 * This service handles all data operations, using Azure APIs as the primary source
 * and falling back to local JSON files only for superusers and companies data.
 */

import { API_CONFIG, getApiUrl } from "../config/api";
import { getAuthHeaders } from "../utils/auth";
import { DATA_URLS, fetchExternalData } from "../config/dataUrls";

// Cache for external JSON data
let usersJsonCache: any[] | null = null;
let companiesJsonCache: any[] | null = null;

// Load users from external URL on first use
async function getUsersJson() {
  if (!usersJsonCache) {
    usersJsonCache = await fetchExternalData<any[]>(DATA_URLS.USERS);
  }
  return usersJsonCache;
}

// Load companies from external URL on first use
async function getCompaniesJson() {
  if (!companiesJsonCache) {
    companiesJsonCache = await fetchExternalData<any[]>(DATA_URLS.COMPANIES);
  }
  return companiesJsonCache;
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface User {
  uid: string;
  username: string;
  password: string;
  role: string;
  companyId: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  cell: string;
  profilePicture: string;
  email?: string;
}

export interface Company {
  companyId: string;
  companyName: string;
  administratorUid: string;
  email: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
}

export interface BusinessUnit {
  buId: string;
  buName: string;
  companyId: string;
  description?: string;
}

export interface UserGroup {
  groupId: string;
  groupName: string;
  companyId: string;
  buId: string;
  description?: string;
}

export interface Store {
  storeId: string;
  storeName: string;
  companyId: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface Role {
  roleId: string;
  roleName: string;
  companyId: string;
  description?: string;
}

export interface Region {
  regionId: string;
  regionName: string;
  companyId: string;
  description?: string;
}

export interface Manager {
  managerId: string;
  managerName: string;
  companyId: string;
  email?: string;
  phone?: string;
}

export interface CompanyEvent {
  eventId: string;
  eventName: string;
  companyId: string;
  eventDate: string;
  description?: string;
}

export interface Instance {
  instanceId: string;
  instanceName: string;
  companyId: string;
  status: string;
  description?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if we should use local fallback for superusers
 */
function shouldUseSuperuserFallback(): boolean {
  const role = localStorage.getItem("role");
  return role === "superuser";
}

/**
 * Generic API request handler with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  suppressErrors: boolean = false
): Promise<T> {
  const url = getApiUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Only log detailed errors if not suppressing (i.e., when we don't have fallback)
      if (!suppressErrors) {
        console.error("❌ API Request Failed:");
        console.error("  URL:", url);
        console.error("  Method:", options.method || "GET");
        console.error("  Status:", response.status, response.statusText);
        console.error("  Response Body:", errorText);
        console.error("  Request Body:", options.body);
      }
      
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    // Check if it's a network error or IP restriction
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (!suppressErrors) {
        console.error('Network error - API may be unreachable:', error);
      }
    }
    throw error;
  }
}

// ============================================================================
// User Service
// ============================================================================

export const UserService = {
  /**
   * Get all users (with superuser fallback)
   */
  async getAll(): Promise<User[]> {
    try {
      const users = await apiRequest<User[]>(API_CONFIG.ENDPOINTS.USERS);
      return users;
    } catch (error) {
      // Silently fall back to local JSON for superusers
      if (shouldUseSuperuserFallback()) {
        console.log("✓ Using local JSON fallback for users");
        return await getUsersJson() as User[];
      }
      console.error("Failed to fetch users from API:", error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  async getById(uid: string): Promise<User | null> {
    // Always try to get from external JSON first to check if user exists there
    let usersJson: any[] = [];
    try {
      usersJson = await getUsersJson();
    } catch (error) {
      console.warn("Failed to load external users JSON:", error);
    }
    
    // Check if user exists in external JSON (for fallback)
    const userExistsInJson = usersJson.some((u) => u.uid === uid);
    
    // Suppress API errors if we have fallback available OR if user is superuser
    const suppressErrors = userExistsInJson || shouldUseSuperuserFallback();
    
    try {
      const user = await apiRequest<User>(API_CONFIG.ENDPOINTS.USER_BY_ID(uid), {}, suppressErrors);
      return user;
    } catch (error) {
      // Fall back to external JSON if user exists there
      if (userExistsInJson) {
        const user = usersJson.find((u) => u.uid === uid);
        if (user) {
          console.log(`✓ Using external JSON fallback for user ${uid}`);
          
          // Check if there are any localStorage updates for this user
          const localUpdatesKey = `user_updates_${uid}`;
          const existingUpdates = localStorage.getItem(localUpdatesKey);
          
          if (existingUpdates) {
            const updates = JSON.parse(existingUpdates);
            const mergedUser = { ...user, ...updates } as User;
            console.log(`✓ Applied localStorage updates to user ${uid}:`, updates);
            return mergedUser;
          }
          
          return user as User;
        }
      }
      
      // User not found in API or external JSON
      console.warn(`⚠ User ${uid} not found in API or external JSON`);
      return null;
    }
  },

  /**
   * Create a new user
   */
  async create(user: Partial<User>): Promise<User> {
    try {
      const newUser = await apiRequest<User>(API_CONFIG.ENDPOINTS.USERS, {
        method: "POST",
        body: JSON.stringify(user),
      });
      return newUser;
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  },

  /**
   * Update an existing user
   */
  async update(uid: string, user: Partial<User>): Promise<User> {
    try {
      console.log("📤 Attempting to update user via API:", uid);
      console.log("📦 User data being sent:", JSON.stringify(user, null, 2));
      
      const updatedUser = await apiRequest<User>(
        API_CONFIG.ENDPOINTS.USER_BY_ID(uid),
        {
          method: "PUT",
          body: JSON.stringify(user),
        }
      );
      return updatedUser;
    } catch (error) {
      console.error(`Failed to update user ${uid}:`, error);
      
      // For superusers with string UIDs, save to localStorage instead
      if (shouldUseSuperuserFallback()) {
        console.log(`✓ Superuser fallback - saving update to localStorage for user ${uid}`);
        
        // Store the user updates in localStorage
        const localUpdatesKey = `user_updates_${uid}`;
        const existingUpdates = localStorage.getItem(localUpdatesKey);
        const updates = existingUpdates ? JSON.parse(existingUpdates) : {};
        
        // Merge new updates with existing ones
        const mergedUpdates = { ...updates, ...user };
        localStorage.setItem(localUpdatesKey, JSON.stringify(mergedUpdates));
        
        // Return the updated user object (merged with existing data)
        const existingUser = (await getUsersJson()).find((u) => u.uid === uid);
        if (existingUser) {
          const mergedUser = { ...existingUser, ...mergedUpdates } as User;
          console.log("✓ Returning merged user data with localStorage updates:", mergedUser);
          return mergedUser;
        }
        // If not in local JSON, just return the partial update as a User
        return user as User;
      }
      
      throw error;
    }
  },

  /**
   * Delete a user
   */
  async delete(uid: string): Promise<void> {
    try {
      await apiRequest<void>(API_CONFIG.ENDPOINTS.USER_BY_ID(uid), {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to delete user ${uid}:`, error);
      throw error;
    }
  },

  /**
   * Get users by company
   */
  async getByCompany(companyId: string): Promise<User[]> {
    try {
      const users = await apiRequest<User[]>(
        API_CONFIG.ENDPOINTS.COMPANY_USERS(companyId)
      );
      return users;
    } catch (error) {
      console.error(`Failed to fetch users for company ${companyId}:`, error);
      if (shouldUseSuperuserFallback()) {
        const users = (await getUsersJson()).filter((u) => u.companyId === companyId);
        return users as User[];
      }
      throw error;
    }
  },
};

// ============================================================================
// Company Service
// ============================================================================

export const CompanyService = {
  /**
   * Get all companies (always use local fallback as backup)
   */
  async getAll(): Promise<Company[]> {
    try {
      const companies = await apiRequest<Company[]>(API_CONFIG.ENDPOINTS.COMPANIES);
      return companies;
    } catch (error) {
      console.error("Failed to fetch companies from API:", error);
      console.log("Using local JSON fallback for companies");
      return await getCompaniesJson() as Company[];
    }
  },

  /**
   * Get company by ID
   */
  async getById(companyId: string): Promise<Company | null> {
    // Always try to get from external JSON first to check if company exists there
    let companiesJson: any[] = [];
    try {
      companiesJson = await getCompaniesJson();
    } catch (error) {
      console.warn("Failed to load external companies JSON:", error);
    }
    
    // Check if company exists in external JSON (for fallback)
    const companyExistsInJson = companiesJson.some((c) => c.companyId === companyId);
    
    // Suppress API errors if we have fallback available
    const suppressErrors = companyExistsInJson;
    
    try {
      const company = await apiRequest<Company>(
        API_CONFIG.ENDPOINTS.COMPANY_BY_ID(companyId),
        {},
        suppressErrors
      );
      return company;
    } catch (error) {
      // Fall back to external JSON if company exists there
      if (companyExistsInJson) {
        const company = companiesJson.find((c) => c.companyId === companyId);
        if (company) {
          console.log(`✓ Using external JSON fallback for company ${companyId}`);
          return company as Company;
        }
      }
      
      // Company not found in API or external JSON
      console.warn(`⚠ Company ${companyId} not found in API or external JSON`);
      return null;
    }
  },

  /**
   * Create a new company
   */
  async create(company: Partial<Company>): Promise<Company> {
    try {
      const newCompany = await apiRequest<Company>(API_CONFIG.ENDPOINTS.COMPANY, {
        method: "POST",
        body: JSON.stringify(company),
      });
      return newCompany;
    } catch (error) {
      console.error("Failed to create company:", error);
      throw error;
    }
  },

  /**
   * Update an existing company
   */
  async update(companyId: string, company: Partial<Company>): Promise<Company> {
    try {
      const updatedCompany = await apiRequest<Company>(
        API_CONFIG.ENDPOINTS.COMPANY_BY_ID(companyId),
        {
          method: "PUT",
          body: JSON.stringify(company),
        }
      );
      return updatedCompany;
    } catch (error) {
      console.error(`Failed to update company ${companyId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a company
   */
  async delete(companyId: string): Promise<void> {
    try {
      await apiRequest<void>(API_CONFIG.ENDPOINTS.COMPANY_BY_ID(companyId), {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to delete company ${companyId}:`, error);
      throw error;
    }
  },
};

// ============================================================================
// Business Unit Service
// ============================================================================

export const BusinessUnitService = {
  async getAll(): Promise<BusinessUnit[]> {
    return apiRequest<BusinessUnit[]>(API_CONFIG.ENDPOINTS.BUSINESS_UNITS);
  },

  async getById(buId: string): Promise<BusinessUnit> {
    return apiRequest<BusinessUnit>(API_CONFIG.ENDPOINTS.BUSINESS_UNIT_BY_ID(buId));
  },

  async getByCompany(companyId: string): Promise<BusinessUnit[]> {
    return apiRequest<BusinessUnit[]>(
      API_CONFIG.ENDPOINTS.BUSINESS_UNITS_BY_COMPANY(companyId)
    );
  },

  async create(bu: Partial<BusinessUnit>): Promise<BusinessUnit> {
    return apiRequest<BusinessUnit>(API_CONFIG.ENDPOINTS.BUSINESS_UNITS, {
      method: "POST",
      body: JSON.stringify(bu),
    });
  },

  async update(buId: string, bu: Partial<BusinessUnit>): Promise<BusinessUnit> {
    return apiRequest<BusinessUnit>(
      API_CONFIG.ENDPOINTS.BUSINESS_UNIT_BY_ID(buId),
      {
        method: "PUT",
        body: JSON.stringify(bu),
      }
    );
  },

  async delete(buId: string): Promise<void> {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.BUSINESS_UNIT_BY_ID(buId), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// User Group Service
// ============================================================================

export const UserGroupService = {
  async getAll(): Promise<UserGroup[]> {
    return apiRequest<UserGroup[]>(API_CONFIG.ENDPOINTS.USER_GROUPS);
  },

  async getById(groupId: string): Promise<UserGroup> {
    return apiRequest<UserGroup>(API_CONFIG.ENDPOINTS.USER_GROUP_BY_ID(groupId));
  },

  async create(group: Partial<UserGroup>): Promise<UserGroup> {
    return apiRequest<UserGroup>(API_CONFIG.ENDPOINTS.USER_GROUPS, {
      method: "POST",
      body: JSON.stringify(group),
    });
  },

  async update(groupId: string, group: Partial<UserGroup>): Promise<UserGroup> {
    return apiRequest<UserGroup>(
      API_CONFIG.ENDPOINTS.USER_GROUP_BY_ID(groupId),
      {
        method: "PUT",
        body: JSON.stringify(group),
      }
    );
  },

  async delete(groupId: string): Promise<void> {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.USER_GROUP_BY_ID(groupId), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// Store Service
// ============================================================================

export const StoreService = {
  async getAll(): Promise<Store[]> {
    return apiRequest<Store[]>(API_CONFIG.ENDPOINTS.STORES);
  },

  async getById(storeId: string): Promise<Store> {
    return apiRequest<Store>(API_CONFIG.ENDPOINTS.STORE_BY_ID(storeId));
  },

  async create(store: Partial<Store>): Promise<Store> {
    return apiRequest<Store>(API_CONFIG.ENDPOINTS.STORES, {
      method: "POST",
      body: JSON.stringify(store),
    });
  },

  async update(storeId: string, store: Partial<Store>): Promise<Store> {
    return apiRequest<Store>(API_CONFIG.ENDPOINTS.STORE_BY_ID(storeId), {
      method: "PUT",
      body: JSON.stringify(store),
    });
  },

  async delete(storeId: string): Promise<void> {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.STORE_BY_ID(storeId), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// Role Service
// ============================================================================

export const RoleService = {
  async getAll(): Promise<Role[]> {
    return apiRequest<Role[]>(API_CONFIG.ENDPOINTS.ROLES);
  },

  async getById(roleId: string): Promise<Role> {
    return apiRequest<Role>(API_CONFIG.ENDPOINTS.ROLE_BY_ID(roleId));
  },

  async create(role: Partial<Role>): Promise<Role> {
    return apiRequest<Role>(API_CONFIG.ENDPOINTS.ROLES, {
      method: "POST",
      body: JSON.stringify(role),
    });
  },

  async update(roleId: string, role: Partial<Role>): Promise<Role> {
    return apiRequest<Role>(API_CONFIG.ENDPOINTS.ROLE_BY_ID(roleId), {
      method: "PUT",
      body: JSON.stringify(role),
    });
  },

  async delete(roleId: string): Promise<void> {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.ROLE_BY_ID(roleId), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// Region Service
// ============================================================================

export const RegionService = {
  async getAll(): Promise<Region[]> {
    return apiRequest<Region[]>(API_CONFIG.ENDPOINTS.REGIONS);
  },

  async getById(regionId: string): Promise<Region> {
    return apiRequest<Region>(API_CONFIG.ENDPOINTS.REGION_BY_ID(regionId));
  },

  async create(region: Partial<Region>): Promise<Region> {
    return apiRequest<Region>(API_CONFIG.ENDPOINTS.REGIONS, {
      method: "POST",
      body: JSON.stringify(region),
    });
  },

  async update(regionId: string, region: Partial<Region>): Promise<Region> {
    return apiRequest<Region>(API_CONFIG.ENDPOINTS.REGION_BY_ID(regionId), {
      method: "PUT",
      body: JSON.stringify(region),
    });
  },

  async delete(regionId: string): Promise<void> {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.REGION_BY_ID(regionId), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// Manager Service
// ============================================================================

export const ManagerService = {
  async getAll(): Promise<Manager[]> {
    return apiRequest<Manager[]>(API_CONFIG.ENDPOINTS.MANAGERS);
  },

  async getById(managerId: string): Promise<Manager> {
    return apiRequest<Manager>(API_CONFIG.ENDPOINTS.MANAGER_BY_ID(managerId));
  },

  async create(manager: Partial<Manager>): Promise<Manager> {
    return apiRequest<Manager>(API_CONFIG.ENDPOINTS.MANAGERS, {
      method: "POST",
      body: JSON.stringify(manager),
    });
  },

  async update(managerId: string, manager: Partial<Manager>): Promise<Manager> {
    return apiRequest<Manager>(API_CONFIG.ENDPOINTS.MANAGER_BY_ID(managerId), {
      method: "PUT",
      body: JSON.stringify(manager),
    });
  },

  async delete(managerId: string): Promise<void> {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.MANAGER_BY_ID(managerId), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// Company Event Service
// ============================================================================

export const CompanyEventService = {
  async getAll(): Promise<CompanyEvent[]> {
    return apiRequest<CompanyEvent[]>(API_CONFIG.ENDPOINTS.COMPANY_EVENTS);
  },

  async getById(eventId: string): Promise<CompanyEvent> {
    return apiRequest<CompanyEvent>(
      API_CONFIG.ENDPOINTS.COMPANY_EVENT_BY_ID(eventId)
    );
  },

  async create(event: Partial<CompanyEvent>): Promise<CompanyEvent> {
    return apiRequest<CompanyEvent>(API_CONFIG.ENDPOINTS.COMPANY_EVENTS, {
      method: "POST",
      body: JSON.stringify(event),
    });
  },

  async update(
    eventId: string,
    event: Partial<CompanyEvent>
  ): Promise<CompanyEvent> {
    return apiRequest<CompanyEvent>(
      API_CONFIG.ENDPOINTS.COMPANY_EVENT_BY_ID(eventId),
      {
        method: "PUT",
        body: JSON.stringify(event),
      }
    );
  },

  async delete(eventId: string): Promise<void> {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.COMPANY_EVENT_BY_ID(eventId), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// Instance Service
// ============================================================================

export const InstanceService = {
  async getAll(): Promise<Instance[]> {
    return apiRequest<Instance[]>(API_CONFIG.ENDPOINTS.INSTANCES);
  },

  async getById(instanceId: string): Promise<Instance> {
    return apiRequest<Instance>(API_CONFIG.ENDPOINTS.INSTANCE_BY_ID(instanceId));
  },

  async create(instance: Partial<Instance>): Promise<Instance> {
    return apiRequest<Instance>(API_CONFIG.ENDPOINTS.INSTANCES, {
      method: "POST",
      body: JSON.stringify(instance),
    });
  },

  async update(instanceId: string, instance: Partial<Instance>): Promise<Instance> {
    return apiRequest<Instance>(API_CONFIG.ENDPOINTS.INSTANCE_BY_ID(instanceId), {
      method: "PUT",
      body: JSON.stringify(instance),
    });
  },

  async delete(instanceId: string): Promise<void> {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.INSTANCE_BY_ID(instanceId), {
      method: "DELETE",
    });
  },
};