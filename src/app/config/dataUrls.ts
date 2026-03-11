/**
 * External JSON Data URLs
 * 
 * All static JSON files are hosted on the webserver root
 * at luna.capitoltechnology.net/data/
 */

// Import local JSON files as fallback
import usersJsonFallback from "../data/users.json";
import companiesJsonFallback from "../data/companies.json";
import websearchJsonFallback from "../data/websearch.json";

export const DATA_URLS = {
  USERS: "https://luna.capitoltechnology.net/data/users.json",
  COMPANIES: "https://luna.capitoltechnology.net/data/companies.json",
  WEBSEARCH: "https://luna.capitoltechnology.net/data/websearch.json",
} as const;

// Map of local fallback data
const LOCAL_FALLBACKS: Record<string, any> = {
  [DATA_URLS.USERS]: usersJsonFallback,
  [DATA_URLS.COMPANIES]: companiesJsonFallback,
  [DATA_URLS.WEBSEARCH]: websearchJsonFallback,
};

/**
 * Helper function to fetch JSON data from external URLs with local fallback
 * 
 * Flow:
 * 1. Try external URL first (for production)
 * 2. If fails (CORS, network, or file not found), fall back to local JSON
 * 
 * This allows development to work locally while production uses external files
 */
export async function fetchExternalData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✓ Successfully fetched data from ${url}`);
    return data;
  } catch (error) {
    // Silently fall back to local data (expected in development)
    const fallbackData = LOCAL_FALLBACKS[url];
    if (fallbackData) {
      console.log('✓ Using local JSON data');
      return fallbackData as T;
    }
    
    // No fallback available - this is a real error
    console.error(`✗ No local fallback available for ${url}`);
    throw new Error(`Failed to fetch data from ${url} and no local fallback available`);
  }
}