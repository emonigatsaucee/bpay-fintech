// API configuration for BPAY
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Same domain in production
  : 'http://localhost:8000/api';

export default API_BASE_URL;