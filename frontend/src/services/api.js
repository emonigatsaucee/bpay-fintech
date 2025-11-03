// API configuration for BPAY
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://bpay-backend.onrender.com/api'  // Update with your actual backend URL
  : 'http://localhost:8000/api';

export default API_BASE_URL;