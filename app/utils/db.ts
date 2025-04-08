import Fuse from 'fuse.js';

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

// Get all applications (with optional pagination)
export const getAllApplications = (
  data: Application[],
  page?: number, 
  pageSize?: number
): Application[] => {
  if (page !== undefined && pageSize !== undefined) {
    const { results } = getPaginatedApplications(data, page, pageSize);
    return results;
  }
  
  return data;
};

// Search applications by a query string across title, description, and code with pagination
export const searchApplications = (
  data: Application[],
  query: string, 
  page: number = 1, 
  pageSize: number = 20
): { results: Application[], total: number } => {
  if (!query.trim()) {
    return getPaginatedApplications(data, page, pageSize);
  }
  
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
  
  const fuse = new Fuse(data, fuseOptions);
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
export const getPaginatedApplications = (
  data: Application[],
  page: number = 1, 
  pageSize: number = 20
): { results: Application[], total: number } => {
  // Get total count
  const total = data.length;
  
  // Calculate start and end indices for pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  
  // Get the slice for the current page
  const results = data.slice(startIndex, endIndex);
  
  return {
    results,
    total
  };
};

// Get an application by its APM code
export const getApplicationByCode = (
  data: Application[],
  code: string
): Application | undefined => {
  return data.find(app => app.apm_application_code === code);
};
