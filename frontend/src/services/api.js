// API configuration for BPAY
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? '${API_BASE_URL}'
  : '/api';  // Same domain in production

export default API_BASE_URL;
