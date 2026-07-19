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
  DEV_MODE: true,
  ROOT_URL: 'https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net',
  BASE_PATH: '/api',
  get BASE_URL() {
    return `${this.ROOT_URL}${this.BASE_PATH}`;
  },
  ENDPOINTS: {
    AUTH_LOGIN_LOCAL: '/Auth/loginLocal',
    AUTH_LOGIN: '/Auth/login',
    AUTH_SIGNUP_LOCAL: '/Auth/signupLocal',
    AUTH_SIGNUP: '/Auth/signup',
    AUTH_FORGOT_PASSWORD_LOCAL: '/Auth/forgotPasswordLocal',
    AUTH_FORGOT_PASSWORD: '/Auth/forgotPassword',
    AUTH_RESET_PASSWORD_PROFILE: '/Auth/resetPasswordProfile',
    AUTH_RESET_PASSWORD_LOCAL: '/Auth/resetPasswordLocal',
    AUTH_RESET_PASSWORD: '/Auth/resetPassword',
    USERS: '/Users',
    USER_BY_ID: (id: number) => `/Users/${id}`,
    USER_LOGOUT: (token: string) => `/Users/logout/${token}`,
    USER_JOIN: '/Users/userjoin',
    COMPANIES: '/Company',
    COMPANY_BY_ID: (id: number) => `/Company/${id}`,
    BUSINESS_UNITS: '/Bu',
    BUSINESS_UNIT_BY_ID: (id: number) => `/Bu/${id}`,
    USER_GROUPS: '/Usergroups',
    USER_GROUP_BY_ID: (id: number) => `/Usergroups/${id}`,
    STORES: '/Store',
    STORE_BY_ID: (id: number) => `/Store/${id}`,
    ROLES: '/Role',
    ROLE_BY_ID: (id: number) => `/Role/${id}`,
    REGIONS: '/Region',
    REGION_BY_ID: (id: number) => `/Region/${id}`,
    MANAGERS: '/Manager',
    MANAGER_BY_ID: (id: number) => `/Manager/${id}`,
    EMPLOYEES: '/Employee',
    EMPLOYEE_BY_ID: (id: number) => `/Employee/${id}`,
    INSTANCES: '/Instance',
    INSTANCE_BY_ID: (id: number) => `/Instance/${id}`,
    COMPANY_EVENTS: '/Companyevents',
    COMPANY_EVENT_BY_ID: (id: number) => `/Companyevents/${id}`,
    WEB_SEARCH: '/Websearch',
    WEB_SEARCH_BY_ID: (id: number) => `/Websearch/${id}`,
    VOICE_SEARCH: '/VoiceSearch',
    VOICE_SEARCH_BY_ID: (id: number) => `/VoiceSearch/${id}`,
    ZEMPWR: '/ZEmpwr',
    ZEMPWR_BY_ID: (id: number) => `/ZEmpwr/${id}`,
    ZGOOGLE: '/ZGoogle',
    USER_HELP: '/Userhelp',
    USER_HELP_BY_ID: (id: number) => `/Userhelp/${id}`,
    USER_LOG: '/Userlog',
    USER_LOG_BY_ID: (id: number) => `/Userlog/${id}`,
    ADMIN_LOGS: '/Adminlogs',
    ADMIN_LOG_BY_ID: (id: number) => `/Adminlogs/${id}`,
    API_LOGS: '/Apilogs',
    API_LOG_BY_ID: (id: number) => `/Apilogs/${id}`,
    USER_SESSION: '/Usersession',
    USER_SESSION_BY_ID: (id: number) => `/Usersession/${id}`,
    AI_AGENTS: '/Aiagent',
    AI_AGENT_BY_ID: (id: number) => `/Aiagent/${id}`,
    VOICE_COMMANDS: '/Voicecommands',
    VOICE_COMMAND_BY_ID: (id: number) => `/Voicecommands/${id}`,
    AI_ACTIONS_VOICE: (command: string) => `/aiactions/voice/${command}`,
    AI_ACTIONS_STATUS: (mapId: string) => `/aiactions/status/${mapId}`,
    BATCHES: '/Batch',
    BATCH_BY_ID: (id: number) => `/Batch/${id}`,
    BATCH_TYPES: '/Batchtype',
    BATCH_TYPE_BY_ID: (id: number) => `/Batchtype/${id}`,
    BATCH_TRANSCRIPTION_UPLOAD: '/BatchTranscription/upload',
    BATCH_TRANSCRIPTION_RUN: '/BatchTranscription/run',
    ACTIVITY_DETAILS: '/Activitydetail',
    ACTIVITY_DETAIL_BY_ID: (id: number) => `/Activitydetail/${id}`,
    ADDBASE: '/Addbase',
    ADDBASE_BY_ID: (id: number) => `/Addbase/${id}`,
    TIMESHEETS: '/Timesheet',
    TIMESHEET_BY_ID: (id: number) => `/Timesheet/${id}`,
    PTO_REQUESTS: '/Pto',
    PTO_REQUEST_BY_ID: (id: number) => `/Pto/${id}`,
    EMPLOYEE_DOCUMENTS: '/Employeedocument',
    EMPLOYEE_DOCUMENT_BY_ID: (id: number) => `/Employeedocument/${id}`,
    SUPER_LUNA: '/SuperLuna',
    SUPER_LUNA_BY_ID: (id: number) => `/SuperLuna/${id}`,
    WEATHER_UNDERGROUND: '/WeatherUnderground',
    WEATHER_UNDERGROUND_BY_ID: (id: number) => `/WeatherUnderground/${id}`,
    SUPER_LUNA_SEARCH: '/SuperLunaSearch',
    SUPER_LUNA_SEARCH_BY_ID: (id: number) => `/SuperLunaSearch/${id}`,
    ZLUNA_CONTEXT_SEARCH: '/ZLunaContextSearch',
    ZCLAUDE: '/Zclaude',
    ACCUWEATHER: (query: string) => `/accuweather/${encodeURIComponent(query)}`,
    ZGROK: '/ZGrok',
    GROUTER: '/GRouter',
    GROUTER_QUERY: '/GRouter/query',
    GSWITCH: '/GSwitch',
    GSWITCH_QUERY: '/GSwitch/query',
    GAPP: '/Gapp',
    GAPP_BY_ID: (id: number) => `/Gapp/${id}`,
  },
};

export function getApiUrl(endpoint: string): string {
  const useBackup = localStorage.getItem('useBackupApi') === 'true';
  const backupRootUrl = localStorage.getItem('backupApiUrl');
  if (useBackup && backupRootUrl) {
    return `${backupRootUrl.replace(/\/$/, '')}${API_CONFIG.BASE_PATH}${endpoint}`;
  }
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = getApiUrl(endpoint);
  const uid = localStorage.getItem('uid');
  const defaultHeaders: HeadersInit = { 'Content-Type': 'application/json' };
  if (uid) defaultHeaders['Authorization'] = `Bearer ${uid}`;
  try {
    const response = await fetch(url, { ...options, headers: { ...defaultHeaders, ...options.headers } });
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        const errorText = await response.text();
        console.error('🚫 API Access Denied - Possible IP Restriction:', { status: response.status, statusText: response.statusText, endpoint, error: errorText });
        if (API_CONFIG.DEV_MODE) console.warn('⚠️ DEV_MODE is enabled - fallback to local data should occur');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Network Error - Cannot reach API:', { endpoint, url, error: error.message });
      if (API_CONFIG.DEV_MODE) console.warn('⚠️ DEV_MODE is enabled - fallback to local data should occur');
    }
    throw error;
  }
}

export async function apiRequestNoAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = getApiUrl(endpoint);
  const defaultHeaders: HeadersInit = { 'Content-Type': 'application/json' };
  try {
    const response = await fetch(url, { ...options, headers: { ...defaultHeaders, ...options.headers } });
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Network Error - Cannot reach API:', { endpoint, url, error: (error as Error).message });
    }
    throw error;
  }
}

export async function checkApiHealth(): Promise<{ accessible: boolean; message: string; ip?: string }> {
  try {
    let currentIp = 'Unknown';
    try { const ipResponse = await fetch('https://api.ipify.org?format=json'); const ipData = await ipResponse.json(); currentIp = ipData.ip; } catch (e) { console.warn('Could not fetch IP address'); }
    await fetch(API_CONFIG.ROOT_URL, { method: 'HEAD', mode: 'no-cors' });
    return { accessible: true, message: 'API is reachable', ip: currentIp };
  } catch (error) {
    let currentIp = 'Unknown';
    try { const ipResponse = await fetch('https://api.ipify.org?format=json'); const ipData = await ipResponse.json(); currentIp = ipData.ip; } catch (e) {}
    return { accessible: false, message: `API is NOT reachable. Your IP: ${currentIp}. This IP may need to be whitelisted in Azure.`, ip: currentIp };
  }
}
