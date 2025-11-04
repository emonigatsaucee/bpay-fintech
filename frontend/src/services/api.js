// API configuration for BPAY
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://bpay-fintech-project.onrender.com/api'
  : 'http://localhost:8000/api';

export default API_BASE_URL;