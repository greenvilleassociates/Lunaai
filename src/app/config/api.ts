/**
 * API Configuration for LunaAI
 * 
 * Root API: lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net
 * Most APIs have a base of /api (e.g., /api/users)
 * 
 * ⚠️ IP RESTRICTION NOTICE:
 * The Azure API is IP address restricted. When developing in Figma Make,
 * requests may be blocked if Figma's IP addresses are not whitelisted.
 * 
 * Development Mode:
 * - Set DEV_MODE to true to use local JSON fallbacks when API is unreachable
 * - Set DEV_MODE to false to require API connectivity (production)
 */

export const API_CONFIG = {
  // Development mode - enables fallback to local JSON when API is unreachable
  DEV_MODE: true,
  
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
 * 
 * Handles IP restriction errors gracefully in development mode
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
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      // Check if it's an IP restriction error (403 Forbidden or similar)
      if (response.status === 403 || response.status === 401) {
        const errorText = await response.text();
        console.error('🚫 API Access Denied - Possible IP Restriction:', {
          status: response.status,
          statusText: response.statusText,
          endpoint: endpoint,
          error: errorText,
        });
        
        if (API_CONFIG.DEV_MODE) {
          console.warn('⚠️ DEV_MODE is enabled - fallback to local data should occur');
        }
      }
      
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    // Network errors (CORS, connection refused, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Network Error - Cannot reach API:', {
        endpoint: endpoint,
        url: url,
        error: error.message,
      });
      
      if (API_CONFIG.DEV_MODE) {
        console.warn('⚠️ DEV_MODE is enabled - fallback to local data should occur');
      }
    }
    
    throw error;
  }
}

/**
 * Check if API is accessible (useful for diagnostics)
 */
export async function checkApiHealth(): Promise<{ accessible: boolean; message: string; ip?: string }> {
  try {
    // First get current IP
    let currentIp = 'Unknown';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      currentIp = ipData.ip;
    } catch (e) {
      console.warn('Could not fetch IP address');
    }
    
    // Try to reach the API root
    const response = await fetch(API_CONFIG.ROOT_URL, {
      method: 'HEAD',
      mode: 'no-cors', // Avoid CORS preflight
    });
    
    return {
      accessible: true,
      message: 'API is reachable',
      ip: currentIp,
    };
  } catch (error) {
    let currentIp = 'Unknown';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      currentIp = ipData.ip;
    } catch (e) {
      // Ignore
    }
    
    return {
      accessible: false,
      message: `API is NOT reachable. Your IP: ${currentIp}. This IP may need to be whitelisted in Azure.`,
      ip: currentIp,
    };
  }
}