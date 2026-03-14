/**
 * API Service for LunaAI
 * 
 * Comprehensive service layer for all API endpoints based on Swagger definition v6.06
 * Provides type-safe API calls with automatic fallback to local JSON for development
 */

import { API_CONFIG, getApiUrl, apiRequest } from '../config/api';
import type {
  User,
  Company,
  Employee,
  LoginRequest,
  LoginResponse,
  Usersession,
  Userlog,
  Userhelp,
  Websearch,
  Bu,
  Region,
  Manager,
  Role,
  Store,
  Instance,
  Usergroups,
  Aiagent,
  Voicecommands,
  Batch,
  Batchtype,
  Activitydetail,
  Addbase,
  Timesheet,
  Companyevent,
  CreateUsersessionRequest,
  CreateUserlogRequest,
  CreateUserhelpRequest,
} from '../types/api';

// ============================================================================
// Authentication APIs
// ============================================================================

export const authApi = {
  /**
   * Login user with username (password-less for current implementation)
   * POST /api/Auth/login
   */
  async login(username: string): Promise<LoginResponse> {
    const response = await apiRequest<any>(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, plainPassword: '' } as LoginRequest),
    });
    return response;
  },

  /**
   * Login user locally (with fallback)
   * POST /api/Auth/loginLocal
   */
  async loginLocal(username: string, password?: string): Promise<LoginResponse> {
    const response = await apiRequest<any>(API_CONFIG.ENDPOINTS.AUTH_LOGIN_LOCAL, {
      method: 'POST',
      body: JSON.stringify({ username, plainPassword: password || '' } as LoginRequest),
    });
    return response;
  },

  /**
   * Signup new user
   * POST /api/Auth/signup
   */
  async signup(userData: Partial<User>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.AUTH_SIGNUP, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Forgot password
   * POST /api/Auth/forgotPassword
   */
  async forgotPassword(email: string): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.AUTH_FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password
   * POST /api/Auth/resetPassword
   */
  async resetPassword(token: string, newPassword: string): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.AUTH_RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

// ============================================================================
// User APIs
// ============================================================================

export const userApi = {
  /**
   * Get all users
   * GET /api/Users
   */
  async getAll(): Promise<User[]> {
    return apiRequest<User[]>(API_CONFIG.ENDPOINTS.USERS);
  },

  /**
   * Get user by ID
   * GET /api/Users/{id}
   */
  async getById(id: number): Promise<User[]> {
    return apiRequest<User[]>(API_CONFIG.ENDPOINTS.USER_BY_ID(id));
  },

  /**
   * Create new user
   * POST /api/Users
   */
  async create(user: Partial<User>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USERS, {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  /**
   * Update user
   * PUT /api/Users/{id}
   */
  async update(id: number, user: Partial<User>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  /**
   * Delete user
   * DELETE /api/Users/{id}
   */
  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_BY_ID(id), {
      method: 'DELETE',
    });
  },

  /**
   * Logout user
   * PUT /api/Users/logout/{token}
   */
  async logout(token: string): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_LOGOUT(token), {
      method: 'PUT',
    });
  },

  /**
   * Get user join data
   * GET /api/Users/userjoin
   */
  async getUserJoin(): Promise<any[]> {
    return apiRequest<any[]>(API_CONFIG.ENDPOINTS.USER_JOIN);
  },
};

// ============================================================================
// Company APIs
// ============================================================================

export const companyApi = {
  /**
   * Get all companies
   * GET /api/Company
   */
  async getAll(): Promise<Company[]> {
    return apiRequest<Company[]>(API_CONFIG.ENDPOINTS.COMPANIES);
  },

  /**
   * Get company by ID
   * GET /api/Company/{id}
   */
  async getById(id: number): Promise<Company[]> {
    return apiRequest<Company[]>(API_CONFIG.ENDPOINTS.COMPANY_BY_ID(id));
  },

  /**
   * Create new company
   * POST /api/Company
   */
  async create(company: Partial<Company>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.COMPANIES, {
      method: 'POST',
      body: JSON.stringify(company),
    });
  },

  /**
   * Update company
   * PUT /api/Company/{id}
   */
  async update(id: number, company: Partial<Company>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.COMPANY_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(company),
    });
  },

  /**
   * Delete company
   * DELETE /api/Company/{id}
   */
  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.COMPANY_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Employee APIs
// ============================================================================

export const employeeApi = {
  /**
   * Get all employees
   * GET /api/Employee
   */
  async getAll(): Promise<Employee[]> {
    return apiRequest<Employee[]>(API_CONFIG.ENDPOINTS.EMPLOYEES);
  },

  /**
   * Get employee by ID
   * GET /api/Employee/{id}
   */
  async getById(id: number): Promise<Employee[]> {
    return apiRequest<Employee[]>(API_CONFIG.ENDPOINTS.EMPLOYEE_BY_ID(id));
  },

  /**
   * Create new employee
   * POST /api/Employee
   */
  async create(employee: Partial<Employee>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.EMPLOYEES, {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  },

  /**
   * Update employee
   * PUT /api/Employee/{id}
   */
  async update(id: number, employee: Partial<Employee>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.EMPLOYEE_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(employee),
    });
  },

  /**
   * Delete employee
   * DELETE /api/Employee/{id}
   */
  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.EMPLOYEE_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// User Session APIs
// ============================================================================

export const usersessionApi = {
  /**
   * Get all user sessions
   * GET /api/Usersession
   */
  async getAll(): Promise<Usersession[]> {
    return apiRequest<Usersession[]>(API_CONFIG.ENDPOINTS.USER_SESSION);
  },

  /**
   * Get user session by ID
   * GET /api/Usersession/{id}
   */
  async getById(id: number): Promise<Usersession[]> {
    return apiRequest<Usersession[]>(API_CONFIG.ENDPOINTS.USER_SESSION_BY_ID(id));
  },

  /**
   * Create new user session
   * POST /api/Usersession
   */
  async create(session: CreateUsersessionRequest): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_SESSION, {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },

  /**
   * Update user session
   * PUT /api/Usersession/{id}
   */
  async update(id: number, session: Partial<Usersession>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_SESSION_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(session),
    });
  },

  /**
   * Delete user session
   * DELETE /api/Usersession/{id}
   */
  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_SESSION_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// User Log APIs
// ============================================================================

export const userlogApi = {
  /**
   * Get all user logs
   * GET /api/Userlog
   */
  async getAll(): Promise<Userlog[]> {
    return apiRequest<Userlog[]>(API_CONFIG.ENDPOINTS.USER_LOG);
  },

  /**
   * Get user log by ID
   * GET /api/Userlog/{id}
   */
  async getById(id: number): Promise<Userlog[]> {
    return apiRequest<Userlog[]>(API_CONFIG.ENDPOINTS.USER_LOG_BY_ID(id));
  },

  /**
   * Create new user log
   * POST /api/Userlog
   */
  async create(log: CreateUserlogRequest): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_LOG, {
      method: 'POST',
      body: JSON.stringify(log),
    });
  },

  /**
   * Update user log
   * PUT /api/Userlog/{id}
   */
  async update(id: number, log: Partial<Userlog>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_LOG_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(log),
    });
  },

  /**
   * Delete user log
   * DELETE /api/Userlog/{id}
   */
  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_LOG_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// User Help APIs
// ============================================================================

export const userhelpApi = {
  /**
   * Get all user help tickets
   * GET /api/Userhelp
   */
  async getAll(): Promise<Userhelp[]> {
    return apiRequest<Userhelp[]>(API_CONFIG.ENDPOINTS.USER_HELP);
  },

  /**
   * Get user help ticket by ID
   * GET /api/Userhelp/{id}
   */
  async getById(id: number): Promise<Userhelp[]> {
    return apiRequest<Userhelp[]>(API_CONFIG.ENDPOINTS.USER_HELP_BY_ID(id));
  },

  /**
   * Create new user help ticket
   * POST /api/Userhelp
   */
  async create(ticket: CreateUserhelpRequest): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_HELP, {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  },

  /**
   * Update user help ticket
   * PUT /api/Userhelp/{id}
   */
  async update(id: number, ticket: Partial<Userhelp>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_HELP_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(ticket),
    });
  },

  /**
   * Delete user help ticket
   * DELETE /api/Userhelp/{id}
   */
  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_HELP_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Business Unit APIs
// ============================================================================

export const buApi = {
  async getAll(): Promise<Bu[]> {
    return apiRequest<Bu[]>(API_CONFIG.ENDPOINTS.BUSINESS_UNITS);
  },

  async getById(id: number): Promise<Bu[]> {
    return apiRequest<Bu[]>(API_CONFIG.ENDPOINTS.BUSINESS_UNIT_BY_ID(id));
  },

  async create(bu: Partial<Bu>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.BUSINESS_UNITS, {
      method: 'POST',
      body: JSON.stringify(bu),
    });
  },

  async update(id: number, bu: Partial<Bu>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.BUSINESS_UNIT_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(bu),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.BUSINESS_UNIT_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Region APIs
// ============================================================================

export const regionApi = {
  async getAll(): Promise<Region[]> {
    return apiRequest<Region[]>(API_CONFIG.ENDPOINTS.REGIONS);
  },

  async getById(id: number): Promise<Region[]> {
    return apiRequest<Region[]>(API_CONFIG.ENDPOINTS.REGION_BY_ID(id));
  },

  async create(region: Partial<Region>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.REGIONS, {
      method: 'POST',
      body: JSON.stringify(region),
    });
  },

  async update(id: number, region: Partial<Region>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.REGION_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(region),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.REGION_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Manager APIs
// ============================================================================

export const managerApi = {
  async getAll(): Promise<Manager[]> {
    return apiRequest<Manager[]>(API_CONFIG.ENDPOINTS.MANAGERS);
  },

  async getById(id: number): Promise<Manager[]> {
    return apiRequest<Manager[]>(API_CONFIG.ENDPOINTS.MANAGER_BY_ID(id));
  },

  async create(manager: Partial<Manager>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.MANAGERS, {
      method: 'POST',
      body: JSON.stringify(manager),
    });
  },

  async update(id: number, manager: Partial<Manager>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.MANAGER_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(manager),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.MANAGER_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Role APIs
// ============================================================================

export const roleApi = {
  async getAll(): Promise<Role[]> {
    return apiRequest<Role[]>(API_CONFIG.ENDPOINTS.ROLES);
  },

  async getById(id: number): Promise<Role[]> {
    return apiRequest<Role[]>(API_CONFIG.ENDPOINTS.ROLE_BY_ID(id));
  },

  async create(role: Partial<Role>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.ROLES, {
      method: 'POST',
      body: JSON.stringify(role),
    });
  },

  async update(id: number, role: Partial<Role>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.ROLE_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(role),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.ROLE_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Store APIs
// ============================================================================

export const storeApi = {
  async getAll(): Promise<Store[]> {
    return apiRequest<Store[]>(API_CONFIG.ENDPOINTS.STORES);
  },

  async getById(id: number): Promise<Store[]> {
    return apiRequest<Store[]>(API_CONFIG.ENDPOINTS.STORE_BY_ID(id));
  },

  async create(store: Partial<Store>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.STORES, {
      method: 'POST',
      body: JSON.stringify(store),
    });
  },

  async update(id: number, store: Partial<Store>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.STORE_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(store),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.STORE_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Instance APIs
// ============================================================================

export const instanceApi = {
  async getAll(): Promise<Instance[]> {
    return apiRequest<Instance[]>(API_CONFIG.ENDPOINTS.INSTANCES);
  },

  async getById(id: number): Promise<Instance[]> {
    return apiRequest<Instance[]>(API_CONFIG.ENDPOINTS.INSTANCE_BY_ID(id));
  },

  async create(instance: Partial<Instance>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.INSTANCES, {
      method: 'POST',
      body: JSON.stringify(instance),
    });
  },

  async update(id: number, instance: Partial<Instance>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.INSTANCE_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(instance),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.INSTANCE_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Company Event APIs
// ============================================================================

export const companyeventApi = {
  async getAll(): Promise<Companyevent[]> {
    return apiRequest<Companyevent[]>(API_CONFIG.ENDPOINTS.COMPANY_EVENTS);
  },

  async getById(id: number): Promise<Companyevent[]> {
    return apiRequest<Companyevent[]>(API_CONFIG.ENDPOINTS.COMPANY_EVENT_BY_ID(id));
  },

  async create(event: Partial<Companyevent>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.COMPANY_EVENTS, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  async update(id: number, event: Partial<Companyevent>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.COMPANY_EVENT_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.COMPANY_EVENT_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Web Search APIs
// ============================================================================

export const websearchApi = {
  async getAll(): Promise<Websearch[]> {
    return apiRequest<Websearch[]>(API_CONFIG.ENDPOINTS.WEB_SEARCH);
  },

  async getById(id: number): Promise<Websearch[]> {
    return apiRequest<Websearch[]>(API_CONFIG.ENDPOINTS.WEB_SEARCH_BY_ID(id));
  },

  async create(search: Partial<Websearch>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.WEB_SEARCH, {
      method: 'POST',
      body: JSON.stringify(search),
    });
  },

  async update(id: number, search: Partial<Websearch>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.WEB_SEARCH_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(search),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.WEB_SEARCH_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// AI Agent APIs
// ============================================================================

export const aiagentApi = {
  async getAll(): Promise<Aiagent[]> {
    return apiRequest<Aiagent[]>(API_CONFIG.ENDPOINTS.AI_AGENTS);
  },

  async getById(id: number): Promise<Aiagent[]> {
    return apiRequest<Aiagent[]>(API_CONFIG.ENDPOINTS.AI_AGENT_BY_ID(id));
  },

  async create(agent: Partial<Aiagent>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.AI_AGENTS, {
      method: 'POST',
      body: JSON.stringify(agent),
    });
  },

  async update(id: number, agent: Partial<Aiagent>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.AI_AGENT_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(agent),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.AI_AGENT_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Voice Command APIs
// ============================================================================

export const voicecommandsApi = {
  async getAll(): Promise<Voicecommands[]> {
    return apiRequest<Voicecommands[]>(API_CONFIG.ENDPOINTS.VOICE_COMMANDS);
  },

  async getById(id: number): Promise<Voicecommands[]> {
    return apiRequest<Voicecommands[]>(API_CONFIG.ENDPOINTS.VOICE_COMMAND_BY_ID(id));
  },

  async create(command: Partial<Voicecommands>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.VOICE_COMMANDS, {
      method: 'POST',
      body: JSON.stringify(command),
    });
  },

  async update(id: number, command: Partial<Voicecommands>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.VOICE_COMMAND_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(command),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.VOICE_COMMAND_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// AI Actions APIs
// ============================================================================

export const aiactionsApi = {
  /**
   * Process voice command
   * POST /api/aiactions/voice/{command}
   */
  async processVoiceCommand(command: string): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.AI_ACTIONS_VOICE(command), {
      method: 'POST',
    });
  },

  /**
   * Get AI action status
   * GET /api/aiactions/status/{mapId}
   */
  async getStatus(mapId: string): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.AI_ACTIONS_STATUS(mapId));
  },
};

// ============================================================================
// Batch APIs
// ============================================================================

export const batchApi = {
  async getAll(): Promise<Batch[]> {
    return apiRequest<Batch[]>(API_CONFIG.ENDPOINTS.BATCHES);
  },

  async getById(id: number): Promise<Batch[]> {
    return apiRequest<Batch[]>(API_CONFIG.ENDPOINTS.BATCH_BY_ID(id));
  },

  async create(batch: Partial<Batch>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.BATCHES, {
      method: 'POST',
      body: JSON.stringify(batch),
    });
  },

  async update(id: number, batch: Partial<Batch>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.BATCH_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(batch),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.BATCH_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Batch Type APIs
// ============================================================================

export const batchtypeApi = {
  async getAll(): Promise<Batchtype[]> {
    return apiRequest<Batchtype[]>(API_CONFIG.ENDPOINTS.BATCH_TYPES);
  },

  async getById(id: number): Promise<Batchtype[]> {
    return apiRequest<Batchtype[]>(API_CONFIG.ENDPOINTS.BATCH_TYPE_BY_ID(id));
  },

  async create(batchtype: Partial<Batchtype>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.BATCH_TYPES, {
      method: 'POST',
      body: JSON.stringify(batchtype),
    });
  },

  async update(id: number, batchtype: Partial<Batchtype>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.BATCH_TYPE_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(batchtype),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.BATCH_TYPE_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Batch Transcription APIs
// ============================================================================

export const batchTranscriptionApi = {
  /**
   * Upload batch transcription
   * POST /api/BatchTranscription/upload
   */
  async upload(formData: FormData): Promise<any> {
    return fetch(getApiUrl(API_CONFIG.ENDPOINTS.BATCH_TRANSCRIPTION_UPLOAD), {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },

  /**
   * Run batch transcription
   * POST /api/BatchTranscription/run
   */
  async run(data: any): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.BATCH_TRANSCRIPTION_RUN, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// Activity Detail APIs
// ============================================================================

export const activitydetailApi = {
  async getAll(): Promise<Activitydetail[]> {
    return apiRequest<Activitydetail[]>(API_CONFIG.ENDPOINTS.ACTIVITY_DETAILS);
  },

  async getById(id: number): Promise<Activitydetail[]> {
    return apiRequest<Activitydetail[]>(API_CONFIG.ENDPOINTS.ACTIVITY_DETAIL_BY_ID(id));
  },

  async create(activity: Partial<Activitydetail>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.ACTIVITY_DETAILS, {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  },

  async update(id: number, activity: Partial<Activitydetail>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.ACTIVITY_DETAIL_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(activity),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.ACTIVITY_DETAIL_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Addbase APIs
// ============================================================================

export const addbaseApi = {
  /**
   * Get all adbase entries
   * GET /api/Addbase
   */
  async getAll(): Promise<Addbase[]> {
    return apiRequest<Addbase[]>(API_CONFIG.ENDPOINTS.ADDBASE);
  },

  /**
   * Get adbase entry by ID
   * GET /api/Addbase/{id}
   */
  async getById(id: number): Promise<Addbase[]> {
    return apiRequest<Addbase[]>(API_CONFIG.ENDPOINTS.ADDBASE_BY_ID(id));
  },

  /**
   * Create new adbase entry
   * POST /api/Addbase
   */
  async create(adbase: Partial<Addbase>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.ADDBASE, {
      method: 'POST',
      body: JSON.stringify(adbase),
    });
  },

  /**
   * Update adbase entry
   * PUT /api/Addbase/{id}
   */
  async update(id: number, adbase: Partial<Addbase>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.ADDBASE_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(adbase),
    });
  },

  /**
   * Delete adbase entry
   * DELETE /api/Addbase/{id}
   */
  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.ADDBASE_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Timesheet APIs
// ============================================================================

export const timesheetApi = {
  async getAll(): Promise<Timesheet[]> {
    return apiRequest<Timesheet[]>(API_CONFIG.ENDPOINTS.TIMESHEETS);
  },

  async getById(id: number): Promise<Timesheet[]> {
    return apiRequest<Timesheet[]>(API_CONFIG.ENDPOINTS.TIMESHEET_BY_ID(id));
  },

  async create(timesheet: Partial<Timesheet>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.TIMESHEETS, {
      method: 'POST',
      body: JSON.stringify(timesheet),
    });
  },

  async update(id: number, timesheet: Partial<Timesheet>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.TIMESHEET_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(timesheet),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.TIMESHEET_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// User Groups APIs
// ============================================================================

export const usergroupsApi = {
  async getAll(): Promise<Usergroups[]> {
    return apiRequest<Usergroups[]>(API_CONFIG.ENDPOINTS.USER_GROUPS);
  },

  async getById(id: number): Promise<Usergroups[]> {
    return apiRequest<Usergroups[]>(API_CONFIG.ENDPOINTS.USER_GROUP_BY_ID(id));
  },

  async create(usergroup: Partial<Usergroups>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_GROUPS, {
      method: 'POST',
      body: JSON.stringify(usergroup),
    });
  },

  async update(id: number, usergroup: Partial<Usergroups>): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_GROUP_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(usergroup),
    });
  },

  async delete(id: number): Promise<any> {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_GROUP_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Export all APIs
// ============================================================================

export default {
  auth: authApi,
  user: userApi,
  company: companyApi,
  employee: employeeApi,
  usersession: usersessionApi,
  userlog: userlogApi,
  userhelp: userhelpApi,
  websearch: websearchApi,
  bu: buApi,
  region: regionApi,
  manager: managerApi,
  role: roleApi,
  store: storeApi,
  instance: instanceApi,
  companyevent: companyeventApi,
  aiagent: aiagentApi,
  voicecommands: voicecommandsApi,
  aiactions: aiactionsApi,
  batch: batchApi,
  batchtype: batchtypeApi,
  batchTranscription: batchTranscriptionApi,
  activitydetail: activitydetailApi,
  addbase: addbaseApi,
  timesheet: timesheetApi,
  usergroups: usergroupsApi,
};