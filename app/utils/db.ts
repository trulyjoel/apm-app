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

// Get all applications
export const getAllApplications = async (): Promise<Application[]> => {
  const db = await openDatabase();
  return db.getAll('applications');
};

// Search applications by a query string across multiple fields
export const searchApplications = async (query: string): Promise<Application[]> => {
  if (!query.trim()) {
    return getAllApplications();
  }
  
  const db = await openDatabase();
  const allApps = await db.getAll('applications');
  
  // Convert query to lowercase for case-insensitive search
  const lowerQuery = query.toLowerCase();
  
  // Filter applications based on the query
  return allApps.filter(app => {
    return (
      app.application_name.toLowerCase().includes(lowerQuery) ||
      app.apm_application_code.toLowerCase().includes(lowerQuery) ||
      app.application_description.toLowerCase().includes(lowerQuery) ||
      app.application_contact.toLowerCase().includes(lowerQuery) ||
      app.it_manager.toLowerCase().includes(lowerQuery) ||
      app.it_vp.toLowerCase().includes(lowerQuery)
    );
  });
};

// Get an application by its APM code
export const getApplicationByCode = async (code: string): Promise<Application | undefined> => {
  const db = await openDatabase();
  return db.get('applications', code);
};
