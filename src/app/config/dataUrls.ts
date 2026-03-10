/**
 * External JSON Data URLs
 * 
 * All static JSON files are hosted on the webserver root
 * at luna.capitoltechnology.net/data/
 */

export const DATA_URLS = {
  USERS: "https://luna.capitoltechnology.net/data/users.json",
  COMPANIES: "https://luna.capitoltechnology.net/data/companies.json",
} as const;

/**
 * Helper function to fetch JSON data from external URLs
 */
export async function fetchExternalData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
}
