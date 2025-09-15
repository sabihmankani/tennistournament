const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // This will be replaced with your actual Bluehost backend URL
    return 'https://your-production-domain.com'; 
  } else {
    return 'http://localhost:3001';
  }
};

export const API_BASE_URL = getApiBaseUrl();
