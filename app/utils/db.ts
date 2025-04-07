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
  
  // For large datasets, we'll use a chunking approach
  const CHUNK_SIZE = 1000; // Process 1000 records at a time
  let allMatches: Application[] = [];
  let processedCount = 0;
  let hasMore = true;
  
  while (hasMore) {
    // Get a chunk of applications
    const tx = db.transaction('applications', 'readonly');
    const store = tx.objectStore('applications');
    const cursor = await store.openCursor();
    
    const chunk: Application[] = [];
    let chunkCount = 0;
    
    // Skip already processed records
    while (cursor && chunkCount < processedCount) {
      await cursor.continue();
      chunkCount++;
    }
    
    // Get the next chunk
    while (cursor && chunk.length < CHUNK_SIZE) {
      chunk.push(cursor.value);
      await cursor.continue();
    }
    
    await tx.done;
    
    // If we got fewer records than the chunk size, we've processed all records
    hasMore = chunk.length === CHUNK_SIZE;
    processedCount += chunk.length;
    
    if (chunk.length === 0) break;
    
    // Configure Fuse.js for this chunk
    const fuseOptions = {
      keys: [
        'application_name',
        'apm_application_code',
        'application_description'
      ],
      threshold: 0.3, // Lower threshold means more strict matching
      includeScore: true
    };
    
    const fuse = new Fuse(chunk, fuseOptions);
    const fuseResults = fuse.search(query);
    
    // Add the matches from this chunk to our overall results
    allMatches = [...allMatches, ...fuseResults.map(result => result.item)];
    
    // If we have enough matches for several pages, we can stop processing
    if (allMatches.length > (page + 5) * pageSize && hasMore) {
      hasMore = false;
    }
  }
  
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
