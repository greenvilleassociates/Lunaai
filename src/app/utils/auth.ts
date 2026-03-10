/**
 * Authentication utilities for API requests
 */

/**
 * Get the stored auth token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

/**
 * Get authorization headers for API requests
 * Uses authToken if available, falls back to uid
 */
export function getAuthHeaders(): Record<string, string> {
  const authToken = getAuthToken();
  const uid = localStorage.getItem("uid");
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  } else if (uid) {
    headers["Authorization"] = `Bearer ${uid}`;
  }

  return headers;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!(localStorage.getItem("uid") || localStorage.getItem("authToken"));
}

/**
 * Get current user ID
 */
export function getCurrentUserId(): string | null {
  return localStorage.getItem("uid");
}

/**
 * Get current username
 */
export function getCurrentUsername(): string | null {
  return localStorage.getItem("username");
}

/**
 * Get current user role
 */
export function getCurrentUserRole(): string | null {
  return localStorage.getItem("role");
}

/**
 * Clear all authentication data
 */
export function clearAuth(): void {
  localStorage.removeItem("uid");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("authToken");
  localStorage.removeItem("sessionToken");
  localStorage.removeItem("sessionStart");
  localStorage.removeItem("loginTime");
  localStorage.removeItem("latitude");
  localStorage.removeItem("longitude");
  localStorage.removeItem("ipAddress");
}
