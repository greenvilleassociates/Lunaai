/**
 * External JSON Data URLs
 * 
 * All static JSON files are hosted on the webserver root
 * at luna.capitoltechnology.net/data/
 */

// Import local JSON files as fallback
import usersJsonFallback from "../data/users.json";
import companiesJsonFallback from "../data/companies.json";

export const DATA_URLS = {
  USERS: "https://luna.capitoltechnology.net/data/users.json",
  COMPANIES: "https://luna.capitoltechnology.net/data/companies.json",
} as const;

// Map of local fallback data
const LOCAL_FALLBACKS: Record<string, any> = {
  [DATA_URLS.USERS]: usersJsonFallback,
  [DATA_URLS.COMPANIES]: companiesJsonFallback,
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
    console.warn(`⚠ Failed to fetch from ${url}, using local fallback`);
    
    // Use local fallback data
    const fallbackData = LOCAL_FALLBACKS[url];
    if (fallbackData) {
      console.log('✓ Using local fallback data');
      return fallbackData as T;
    }
    
    // No fallback available
    console.error(`✗ No local fallback available for ${url}`);
    throw new Error(`Failed to fetch data from ${url} and no local fallback available`);
  }
}