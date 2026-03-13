/**
 * External JSON Data URLs
 * 
 * All static JSON files are hosted in /public/Data/ folder
 * which will be automatically published with Vite build.
 * External URLs point to luna.capitoltechnology.net/Data/
 */

// Import local JSON files as fallback
import usersJsonFallback from "../data/users.json";
import companiesJsonFallback from "../data/companies.json";
import websearchJsonFallback from "../data/websearch.json";

// Public folder URLs (Vite will serve from /Data/)
export const DATA_URLS = {
  USERS: "/Data/users.json",
  COMPANIES: "/Data/companies.json",
  WEBSEARCH: "/Data/websearch.json",
} as const;

// External production URLs
export const EXTERNAL_DATA_URLS = {
  USERS: "https://luna.capitoltechnology.net/Data/users.json",
  COMPANIES: "https://luna.capitoltechnology.net/Data/companies.json",
  WEBSEARCH: "https://luna.capitoltechnology.net/Data/websearch.json",
} as const;

// Map of local fallback data
const LOCAL_FALLBACKS: Record<string, any> = {
  [DATA_URLS.USERS]: usersJsonFallback,
  [DATA_URLS.COMPANIES]: companiesJsonFallback,
  [DATA_URLS.WEBSEARCH]: websearchJsonFallback,
};

/**
 * Helper function to fetch JSON data with fallback strategy
 * 
 * Flow:
 * 1. Try public /Data/ folder (served by Vite)
 * 2. If fails, fall back to imported local JSON from src/app/data/
 * 
 * This allows:
 * - Development: Uses /public/Data/ JSON files
 * - Production: Same /Data/ files are deployed with the app
 * - Fallback: If public files missing, uses bundled JSON
 */
export async function fetchExternalData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url, {
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
    // Fall back to bundled local data
    const fallbackData = LOCAL_FALLBACKS[url];
    if (fallbackData) {
      console.log(`⚠ Failed to fetch ${url}, using bundled JSON fallback`);
      return fallbackData as T;
    }
    
    // No fallback available - this is a real error
    console.error(`✗ No local fallback available for ${url}`);
    throw new Error(`Failed to fetch data from ${url} and no local fallback available`);
  }
}
