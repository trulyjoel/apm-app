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
  let addedCount = 0;
  for (const app of data) {
    await tx.objectStore('applications').add(app);
    addedCount++;
  }
  
  await tx.done;
  console.log('Database initialized with', addedCount, 'applications out of', data.length);
  
  // Verify data was added
  const count = await db.count('applications');
  console.log('Actual count in database:', count);
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

import Fuse from 'fuse.js';

// Search applications by a query string across title, description, and code with pagination
export const searchApplications = async (
  query: string, 
  page: number = 1, 
  pageSize: number = 20
): Promise<{ results: Application[], total: number }> => {
  if (!query.trim()) {
    return getPaginatedApplications(page, pageSize);
  }
  
  // Get all applications from IndexedDB
  const db = await openDatabase();
  
  // Get all applications first (this is more reliable for smaller datasets)
  const allApplications = await db.getAll('applications');
  
  // Configure Fuse.js for fuzzy search
  const fuseOptions = {
    keys: [
      'application_name',
      'apm_application_code',
      'application_description'
    ],
    threshold: 0.3, // Lower threshold means more strict matching
    includeScore: true
  };
  
  const fuse = new Fuse(allApplications, fuseOptions);
  const fuseResults = fuse.search(query);
  
  // Extract just the items from the Fuse results
  const allMatches = fuseResults.map(result => result.item);
    
  // Calculate total and paginate results
  const total = allMatches.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedResults = allMatches.slice(startIndex, endIndex);
  
  return {
    results: paginatedResults,
    total
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
  
  // Get all applications (for smaller datasets this is more reliable)
  const allApplications = await db.getAll('applications');
  
  // Calculate start and end indices for pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, allApplications.length);
  
  // Get the slice for the current page
  const results = allApplications.slice(startIndex, endIndex);
  
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
