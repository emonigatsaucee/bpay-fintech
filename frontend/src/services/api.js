// API configuration for BPAY
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/api'
  : '/api';  // Same domain in production

export default API_BASE_URL;