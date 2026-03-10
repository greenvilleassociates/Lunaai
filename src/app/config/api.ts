/**
 * API Configuration for LunaAI
 * 
 * Root API: lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net
 * Most APIs have a base of /api (e.g., /api/users)
 */

export const API_CONFIG = {
  // Root API URL on Azure
  ROOT_URL: 'https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net',
  
  // API base path
  BASE_PATH: '/api',
  
  // Full base URL
  get BASE_URL() {
    return `${this.ROOT_URL}${this.BASE_PATH}`;
  },
  
  // API Endpoints
  ENDPOINTS: {
    // User Management
    USERS: '/users',
    USER_BY_ID: (uid: string) => `/users/${uid}`,
    USER_LOGIN: '/users/login',
    USER_LOGOUT: '/users/logout',
    
    // Company Management
    COMPANIES: '/companies',
    COMPANY: '/Company',
    COMPANY_BY_ID: (id: string) => `/companies/${id}`,
    COMPANY_USERS: (companyId: string) => `/companies/${companyId}/users`,
    
    // Business Unit Management
    BUSINESS_UNITS: '/Bu',
    BUSINESS_UNIT_BY_ID: (id: string) => `/Bu/${id}`,
    BUSINESS_UNITS_BY_COMPANY: (companyId: string) => `/Bu/company/${companyId}`,
    
    // User Groups Management
    USER_GROUPS: '/Usergroups',
    USER_GROUP_BY_ID: (id: string) => `/Usergroups/${id}`,
    
    // Store Management
    STORES: '/Store',
    STORE_BY_ID: (id: string) => `/Store/${id}`,
    
    // Role Management
    ROLES: '/Role',
    ROLE_BY_ID: (id: string) => `/Role/${id}`,
    
    // Region Management
    REGIONS: '/Region',
    REGION_BY_ID: (id: string) => `/Region/${id}`,
    
    // Manager Management
    MANAGERS: '/Manager',
    MANAGER_BY_ID: (id: string) => `/Manager/${id}`,
    
    // Company Events Management
    COMPANY_EVENTS: '/Companyevents',
    COMPANY_EVENT_BY_ID: (id: string) => `/Companyevents/${id}`,
    
    // Instance Management
    INSTANCES: '/Instance',
    INSTANCE_BY_ID: (id: string) => `/Instance/${id}`,
    
    // Web Search / AI Lookup
    WEB_SEARCH: '/Websearch',
    WEB_SEARCH_BY_ID: (id: string) => `/Websearch/${id}`,
    
    // User Help / Trouble Tickets
    USER_HELP: '/Userhelp',
    USER_HELP_BY_ID: (id: string) => `/Userhelp/${id}`,
    
    // User Logs
    USER_LOG: '/Userlog',
    USER_LOG_BY_ID: (id: string) => `/Userlog/${id}`,
    
    // User Sessions
    USER_SESSION: '/Usersession',
    USER_SESSION_BY_ID: (id: string) => `/Usersession/${id}`,
    
    // Authentication
    AUTH_LOGIN: '/Auth/login',
    AUTH_VERIFY: '/auth/verify',
    AUTH_REFRESH: '/auth/refresh',
    AUTH_SIGNUP: '/Auth/signup',
    
    // LLM Processing
    LLM_PROCESS: '/llm/process',
    LLM_CHAIN: '/llm/chain',
    LLM_STATUS: (jobId: string) => `/llm/status/${jobId}`,
    
    // File Upload
    UPLOAD_PROMPT: '/upload/prompt',
    UPLOAD_FILE: '/upload/file',
    
    // Voice/Recording
    VOICE_RECORDING: '/voice/recording',
    VOICE_PROCESS: '/voice/process',
    
    // Analytics/Visualizations
    ANALYTICS: '/analytics',
    VISUALIZATIONS: '/visualizations',
    
    // Transactions
    TRANSACTIONS: '/transactions',
    TRANSACTION_BY_ID: (id: string) => `/transactions/${id}`,
  },
};

/**
 * Helper function to build full API URLs
 */
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * Helper function for making API requests with standard headers
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  
  // Get auth token from localStorage
  const uid = localStorage.getItem('uid');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if user is logged in
  if (uid) {
    defaultHeaders['Authorization'] = `Bearer ${uid}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}