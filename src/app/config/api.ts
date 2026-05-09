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
    // Authentication (uses /api/Auth)
    AUTH_LOGIN_LOCAL: '/Auth/loginLocal',
    AUTH_LOGIN: '/Auth/login',
    AUTH_SIGNUP_LOCAL: '/Auth/signupLocal',
    AUTH_SIGNUP: '/Auth/signup',
    AUTH_FORGOT_PASSWORD_LOCAL: '/Auth/forgotPasswordLocal',
    AUTH_FORGOT_PASSWORD: '/Auth/forgotPassword',
    AUTH_RESET_PASSWORD_PROFILE: '/Auth/resetPasswordProfile',
    AUTH_RESET_PASSWORD_LOCAL: '/Auth/resetPasswordLocal',
    AUTH_RESET_PASSWORD: '/Auth/resetPassword',
    
    // User Management (uses /api/Users)
    USERS: '/Users',
    USER_BY_ID: (id: number) => `/Users/${id}`,
    USER_LOGOUT: (token: string) => `/Users/logout/${token}`,
    USER_JOIN: '/Users/userjoin',
    
    // Company Management (uses /api/Company)
    COMPANIES: '/Company',
    COMPANY_BY_ID: (id: number) => `/Company/${id}`,
    
    // Business Unit Management (uses /api/Bu)
    BUSINESS_UNITS: '/Bu',
    BUSINESS_UNIT_BY_ID: (id: number) => `/Bu/${id}`,
    
    // User Groups Management (uses /api/Usergroups)
    USER_GROUPS: '/Usergroups',
    USER_GROUP_BY_ID: (id: number) => `/Usergroups/${id}`,
    
    // Store Management (uses /api/Store)
    STORES: '/Store',
    STORE_BY_ID: (id: number) => `/Store/${id}`,
    
    // Role Management (uses /api/Role)
    ROLES: '/Role',
    ROLE_BY_ID: (id: number) => `/Role/${id}`,
    
    // Region Management (uses /api/Region)
    REGIONS: '/Region',
    REGION_BY_ID: (id: number) => `/Region/${id}`,
    
    // Manager Management (uses /api/Manager)
    MANAGERS: '/Manager',
    MANAGER_BY_ID: (id: number) => `/Manager/${id}`,
    
    // Employee Management (uses /api/Employee)
    EMPLOYEES: '/Employee',
    EMPLOYEE_BY_ID: (id: number) => `/Employee/${id}`,
    
    // Instance Management (uses /api/Instance)
    INSTANCES: '/Instance',
    INSTANCE_BY_ID: (id: number) => `/Instance/${id}`,
    
    // Company Events Management (uses /api/Companyevents)
    COMPANY_EVENTS: '/Companyevents',
    COMPANY_EVENT_BY_ID: (id: number) => `/Companyevents/${id}`,
    
    // Web Search / AI Lookup (uses /api/Websearch)
    WEB_SEARCH: '/Websearch',
    WEB_SEARCH_BY_ID: (id: number) => `/Websearch/${id}`,

    // Voice Search (uses /api/VoiceSearch)
    VOICE_SEARCH: '/VoiceSearch',
    VOICE_SEARCH_BY_ID: (id: number) => `/VoiceSearch/${id}`,

    // Empwr Enterprise Search (uses /api/ZEmpwr)
    ZEMPWR: '/ZEmpwr',
    ZEMPWR_BY_ID: (id: number) => `/ZEmpwr/${id}`,

    // Google Gemini Search (uses /api/ZGoogle)
    ZGOOGLE: '/ZGoogle',
    
    // User Help / Trouble Tickets (uses /api/Userhelp)
    USER_HELP: '/Userhelp',
    USER_HELP_BY_ID: (id: number) => `/Userhelp/${id}`,
    
    // User Logs (uses /api/Userlog)
    USER_LOG: '/Userlog',
    USER_LOG_BY_ID: (id: number) => `/Userlog/${id}`,

    // Admin Logs (uses /api/Adminlogs)
    ADMIN_LOGS: '/Adminlogs',
    ADMIN_LOG_BY_ID: (id: number) => `/Adminlogs/${id}`,

    // API Logs (uses /api/Apilogs)
    API_LOGS: '/Apilogs',
    API_LOG_BY_ID: (id: number) => `/Apilogs/${id}`,

    // User Sessions (uses /api/Usersession)
    USER_SESSION: '/Usersession',
    USER_SESSION_BY_ID: (id: number) => `/Usersession/${id}`,
    
    // AI Agents (uses /api/Aiagent)
    AI_AGENTS: '/Aiagent',
    AI_AGENT_BY_ID: (id: number) => `/Aiagent/${id}`,
    
    // Voice Commands (uses /api/Voicecommands)
    VOICE_COMMANDS: '/Voicecommands',
    VOICE_COMMAND_BY_ID: (id: number) => `/Voicecommands/${id}`,
    
    // AI Actions (uses /api/aiactions)
    AI_ACTIONS_VOICE: (command: string) => `/aiactions/voice/${command}`,
    AI_ACTIONS_STATUS: (mapId: string) => `/aiactions/status/${mapId}`,
    
    // Batch Processing (uses /api/Batch)
    BATCHES: '/Batch',
    BATCH_BY_ID: (id: number) => `/Batch/${id}`,
    BATCH_TYPES: '/Batchtype',
    BATCH_TYPE_BY_ID: (id: number) => `/Batchtype/${id}`,
    
    // Batch Transcription (uses /api/BatchTranscription)
    BATCH_TRANSCRIPTION_UPLOAD: '/BatchTranscription/upload',
    BATCH_TRANSCRIPTION_RUN: '/BatchTranscription/run',
    
    // Activity Details (uses /api/Activitydetail)
    ACTIVITY_DETAILS: '/Activitydetail',
    ACTIVITY_DETAIL_BY_ID: (id: number) => `/Activitydetail/${id}`,
    
    // Addbase (uses /api/Addbase)
    ADDBASE: '/Addbase',
    ADDBASE_BY_ID: (id: number) => `/Addbase/${id}`,
    
    // Timesheet (uses /api/Timesheet)
    TIMESHEETS: '/Timesheet',
    TIMESHEET_BY_ID: (id: number) => `/Timesheet/${id}`,

    // PTO Requests (uses /api/Pto)
    PTO_REQUESTS: '/Pto',
    PTO_REQUEST_BY_ID: (id: number) => `/Pto/${id}`,

    // Employee Documents (uses /api/Employeedocument)
    EMPLOYEE_DOCUMENTS: '/Employeedocument',
    EMPLOYEE_DOCUMENT_BY_ID: (id: number) => `/Employeedocument/${id}`,

    // SuperLuna (uses /api/SuperLuna)
    SUPER_LUNA: '/SuperLuna',
    SUPER_LUNA_BY_ID: (id: number) => `/SuperLuna/${id}`,

    // Weather Underground / IBM Weather (uses /api/WeatherUnderground)
    WEATHER_UNDERGROUND: '/WeatherUnderground',
    WEATHER_UNDERGROUND_BY_ID: (id: number) => `/WeatherUnderground/${id}`,

    // SuperLuna Search (uses /api/SuperLunaSearch)
    SUPER_LUNA_SEARCH: '/SuperLunaSearch',
    SUPER_LUNA_SEARCH_BY_ID: (id: number) => `/SuperLunaSearch/${id}`,

    // Luna Context Router (uses /api/ZLunaContextSearch)
    ZLUNA_CONTEXT_SEARCH: '/ZLunaContextSearch',

    // Claude AI (uses /api/Zclaude)
    ZCLAUDE: '/Zclaude',

    // Grok AI (uses /api/ZGrok)
    ZGROK: '/ZGrok',

    // Network Device Endpoints (uses /api/GRouter, /api/GSwitch)
    GROUTER: '/GRouter',
    GROUTER_QUERY: '/GRouter/query',
    GSWITCH: '/GSwitch',
    GSWITCH_QUERY: '/GSwitch/query',

    // Grid Apps (uses /api/Gapp)
    GAPP: '/Gapp',
    GAPP_BY_ID: (id: number) => `/Gapp/${id}`,
  },
};

/**
 * Helper function to build full API URLs.
 * If a backup API is configured and active in localStorage, uses that instead.
 */
export function getApiUrl(endpoint: string): string {
  const useBackup = localStorage.getItem('useBackupApi') === 'true';
  const backupRootUrl = localStorage.getItem('backupApiUrl');

  if (useBackup && backupRootUrl) {
    return `${backupRootUrl.replace(/\/$/, '')}${API_CONFIG.BASE_PATH}${endpoint}`;
  }

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