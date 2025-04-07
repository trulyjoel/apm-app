// IndexedDB utility functions
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface AppDB extends DBSchema {
  applications: {
    key: string; // apm_application_code as the key
    value: Application;
    indexes: {
      'by_name': string;
    };
  };
}

// Define the type for application data
export interface Application {
  apm_application_code: string;
  application_name: string;
  application_description: string;
  application_lifecycle: string;
  critical_information_asset: string;
  application_security_release_assessment_required: string;
  application_contact: string;
  application_contact_email: string;
  application_contact_title: string;
  it_manager: string;
  itmanageremail: string;
  it_manager_title: string;
  it_vp: string;
  itvpemail: string;
  it_vp_title: string;
  user_interface: string;
  isusapp: string;
}

// Database name and version
const DB_NAME = 'apm-database';
const DB_VERSION = 1;

// Open the database
export const openDatabase = async (): Promise<IDBPDatabase<AppDB>> => {
  return openDB<AppDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create the applications object store if it doesn't exist
      if (!db.objectStoreNames.contains('applications')) {
        const store = db.createObjectStore('applications', { keyPath: 'apm_application_code' });
        // Create an index on the application name for faster searches
        store.createIndex('by_name', 'application_name');
      }
    },
  });
};

// Initialize the database with data
export const initializeDatabase = async (data: Application[]): Promise<void> => {
  const db = await openDatabase();
  const tx = db.transaction('applications', 'readwrite');
  
  // Clear existing data
  await tx.objectStore('applications').clear();
  
  // Add all applications
  for (const app of data) {
    await tx.objectStore('applications').add(app);
  }
  
  await tx.done;
  console.log('Database initialized with', data.length, 'applications');
};

// Get all applications (with optional pagination)
export const getAllApplications = async (page?: number, pageSize?: number): Promise<Application[]> => {
  if (page !== undefined && pageSize !== undefined) {
    const { results } = await getPaginatedApplications(page, pageSize);
    return results;
  }
  
  // If no pagination is requested, return all (use with caution for large datasets)
  const db = await openDatabase();
  return db.getAll('applications');
};

// Search applications by a query string across title, description, and code with pagination
export const searchApplications = async (
  query: string, 
  page: number = 1, 
  pageSize: number = 20
): Promise<{ results: Application[], total: number }> => {
  if (!query.trim()) {
    return getPaginatedApplications(page, pageSize);
  }
  
  const db = await openDatabase();
  
  // Convert query to lowercase for case-insensitive search
  const lowerQuery = query.toLowerCase();
  
  // Create a cursor to iterate through all applications
  const tx = db.transaction('applications', 'readonly');
  const store = tx.objectStore('applications');
  const cursor = await store.openCursor();
  
  const matches: Application[] = [];
  let count = 0;
  
  // Use cursor to process records in chunks without loading everything into memory
  while (cursor) {
    const app = cursor.value;
    
    // Check if the application matches the search criteria
    // Only search title, description, and apm_application_code
    if (
      app.application_name.toLowerCase().includes(lowerQuery) ||
      app.apm_application_code.toLowerCase().includes(lowerQuery) ||
      app.application_description.toLowerCase().includes(lowerQuery)
    ) {
      count++;
      
      // Only collect items for the requested page
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      if (count > startIndex && count <= endIndex) {
        matches.push(app);
      }
      
      // If we've collected enough items for this page and counted beyond what we need
      // for pagination info, we can stop
      if (count > endIndex && matches.length >= pageSize) {
        // Continue counting to get total, but limit to reasonable number
        if (count > endIndex + 1000) {
          break;
        }
      }
    }
    
    await cursor.continue();
  }
  
  await tx.done;
  
  return {
    results: matches,
    total: count
  };
};

// Get applications with pagination
export const getPaginatedApplications = async (
  page: number = 1, 
  pageSize: number = 20
): Promise<{ results: Application[], total: number }> => {
  const db = await openDatabase();
  
  // Get total count
  const total = await db.count('applications');
  
  // Calculate start and end indices
  const startIndex = (page - 1) * pageSize;
  
  // Get applications for the current page
  const tx = db.transaction('applications', 'readonly');
  const store = tx.objectStore('applications');
  const cursor = await store.openCursor();
  
  const results: Application[] = [];
  let count = 0;
  
  while (cursor && results.length < pageSize) {
    if (count >= startIndex) {
      results.push(cursor.value);
    }
    
    count++;
    await cursor.continue();
  }
  
  await tx.done;
  
  return {
    results,
    total
  };
};

// Get an application by its APM code
export const getApplicationByCode = async (code: string): Promise<Application | undefined> => {
  const db = await openDatabase();
  return db.get('applications', code);
};
