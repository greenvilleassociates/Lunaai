/**
 * TypeScript types generated from LunaAPI Swagger definition (v6.06)
 * Source: /src/imports/swagger.json
 */

// ============================================================================
// Core Entity Types
// ============================================================================

export interface User {
  id?: number;
  firstname?: string | null;
  lastname?: string | null;
  username?: string | null;
  email?: string | null;
  employee?: number | null;
  employeeid?: string | null;
  microsoftid?: string | null;
  ncrid?: string | null;
  oracleid?: string | null;
  azureid?: string | null;
  plainpassword?: string | null;
  hashedpassword?: string | null;
  passwordtype?: number | null;
  jid?: number | null;
  profileurl?: string | null;
  role?: string | null;
  fullname?: string | null;
  companyid?: number | null;
  resettoken?: string | null;
  resettokenexpiration?: string | null;
  userid?: number | null;
  useridstring?: string | null;
  displayname?: string | null;
  btn?: string | null;
  iscertified?: number | null;
  groupid1?: string | null;
  groupid2?: string | null;
  groupid3?: string | null;
  groupid4?: string | null;
  groupid5?: string | null;
  accountstatus?: string | null;
  accountactiondate?: string | null;
  accountactiondescription?: string | null;
}

export interface Company {
  id?: number;
  companyname?: string | null;
  dynamicsid?: string | null;
  ncralohaid?: string | null;
  oracleid?: string | null;
  certAuthority?: string | null;
  instancedid?: string | null;
}

export interface Employee {
  id?: number;
  employeeid?: string | null;
  firstname?: string | null;
  middlename?: string | null;
  lastname?: string | null;
  fullname?: string | null;
  email?: string | null;
  phone?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  hiredate?: string | null;
  terminationdate?: string | null;
  status?: string | null;
  department?: string | null;
  jobtitle?: string | null;
  managerid?: number | null;
  companyid?: number | null;
  userid?: number | null;
}

export interface LoginRequest {
  username?: string | null;
  plainPassword?: string | null;
}

export interface LoginResponse {
  success?: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface Usersession {
  id?: number;
  userid?: number | null;
  sessiontoken?: string | null;
  logintime?: string | null;
  logouttime?: string | null;
  ipaddress?: string | null;
  devicetype?: string | null;
  browser?: string | null;
  location?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  isactive?: boolean | null;
}

export interface Userlog {
  id?: number;
  userid?: number | null;
  action?: string | null;
  timestamp?: string | null;
  ipaddress?: string | null;
  details?: string | null;
  modulename?: string | null;
  severity?: string | null;
}

export interface Companyevent {
  id?: number;
  eventid?: string | null;
  description?: string | null;
  startdate?: string | null;
  enddate?: string | null;
}

export interface Userhelp {
  id?: number;
  userid?: number | null;
  subject?: string | null;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  createddate?: string | null;
  resolveddate?: string | null;
  assignedto?: number | null;
  category?: string | null;
  attachments?: string | null;
}

export interface Websearch {
  id?: number;
  searchquery?: string | null;
  results?: string | null;
  timestamp?: string | null;
  userid?: number | null;
  source?: string | null;
  relevancescore?: number | null;
}

// ============================================================================
// Management Entities
// ============================================================================

export interface Bu {
  id?: number;
  buname?: string | null;
  companyid?: number | null;
  description?: string | null;
  managerid?: number | null;
  regionid?: number | null;
}

export interface Region {
  id?: number;
  regionname?: string | null;
  companyid?: number | null;
  description?: string | null;
  managerid?: number | null;
}

export interface Manager {
  id?: number;
  firstname?: string | null;
  lastname?: string | null;
  fullname?: string | null;
  email?: string | null;
  phone?: string | null;
  employeeid?: string | null;
  userid?: number | null;
  companyid?: number | null;
}

export interface Role {
  id?: number;
  rolename?: string | null;
  description?: string | null;
  permissions?: string | null;
  companyid?: number | null;
}

export interface Store {
  id?: number;
  storename?: string | null;
  storenumber?: string | null;
  companyid?: number | null;
  regionid?: number | null;
  managerid?: number | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface Instance {
  id?: number;
  instancename?: string | null;
  instancetype?: string | null;
  companyid?: number | null;
  status?: string | null;
  ipaddress?: string | null;
  port?: number | null;
  configurationjson?: string | null;
}

export interface Usergroups {
  id?: number;
  groupname?: string | null;
  description?: string | null;
  companyid?: number | null;
  createddate?: string | null;
  createdby?: number | null;
}

// ============================================================================
// AI & Processing Entities
// ============================================================================

export interface Aiagent {
  id?: number;
  ipprimary?: string | null;
  ipsecondary?: string | null;
  siteid?: number | null;
  instanceid?: number | null;
  shardid?: number | null;
  description?: string | null;
  osvariant?: string | null;
  agenttype?: string | null;
  accessstringencrypted?: string | null;
  hashid?: number | null;
  aroot?: number | null;
}

export interface Voicecommands {
  id?: number;
  command?: string | null;
  description?: string | null;
  userid?: number | null;
  timestamp?: string | null;
  processed?: boolean | null;
  result?: string | null;
}

export interface Batch {
  id?: number;
  batchname?: string | null;
  filelocationpath?: string | null;
  batchtype?: number | null;
  status?: string | null;
  createddate?: string | null;
  processeddate?: string | null;
  userid?: number | null;
  companyid?: number | null;
}

export interface Batchtype {
  id?: number;
  typename?: string | null;
  description?: string | null;
}

// ============================================================================
// Activity & Tracking Entities
// ============================================================================

export interface Activitydetail {
  id?: number;
  description?: string | null;
  category?: string | null;
  startdate?: string | null;
  enddate?: string | null;
  certauthority?: string | null;
  status?: string | null;
  emplid?: string | null;
  location?: string | null;
  userid?: number | null;
  employee?: number | null;
  fullname?: string | null;
}

export interface Addbase {
  id?: number;
  addid?: string | null;
  sourceip?: string | null;
  destinationip?: string | null;
  clientid?: string | null;
  mktgurl?: string | null;
  origplatform?: string | null;
  targetplatform?: string | null;
  uid?: string | null;
  ulat?: string | null;
  ulong?: string | null;
  cost?: number | null;
  price?: number | null;
  discount?: number | null;
}

export interface Timesheet {
  id?: number;
  employeeid?: number | null;
  date?: string | null;
  hoursworked?: number | null;
  projectid?: number | null;
  taskdescription?: string | null;
  status?: string | null;
  approvedby?: number | null;
  approveddate?: string | null;
}

export interface Gapp {
  id?: number;
  appid?: string | null;
  appdescription?: string | null;
  apptype?: number | null;
  appregion?: number | null;
  dbmstype?: string | null;
  dbmsvendor?: string | null;
  dbmstopology?: string | null;
  gridid?: number | null;
  targetgeometry?: string | null;
  targetgrid?: string | null;
  targetgridid?: number | null;
  iscompliant?: number | null;
  licenseid?: string | null;
  vendorid?: number | null;
  versionnumber?: string | null;
  totalseats?: number | null;
  licenseexpiration?: string | null;
  licensetype?: number | null;
  legalcontactid?: number | null;
  whynoncompliant?: string | null;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateUserRequest extends Omit<User, 'id'> {}
export interface UpdateUserRequest extends Partial<User> {}

export interface CreateCompanyRequest extends Omit<Company, 'id'> {}
export interface UpdateCompanyRequest extends Partial<Company> {}

export interface CreateUsersessionRequest extends Omit<Usersession, 'id'> {}
export interface UpdateUsersessionRequest extends Partial<Usersession> {}

export interface CreateUserlogRequest extends Omit<Userlog, 'id'> {}

export interface CreateUserhelpRequest extends Omit<Userhelp, 'id'> {}
export interface UpdateUserhelpRequest extends Partial<Userhelp> {}