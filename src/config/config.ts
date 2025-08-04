// Configuration file for API endpoints and URLs
export const config = {
  // Supabase database URL
  supabase_server_url: 'https://db.nymia.ai/rest/v1',
  
  // Backend API URL
  backend_url: 'https://api.nymia.ai/v1',
  
  // Data/Images URL
  data_url: '${config.data_url}'
};

export default config; 