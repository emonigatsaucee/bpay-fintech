import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, googleAuth } from '../services/api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showFeatures, setShowFeatures] = useState(false);
  const navigate = useNavigate();

  // Auto-show features after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowFeatures(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID",
        callback: handleGoogleResponse
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true);
      const result = await googleAuth(response.credential);
      localStorage.setItem('token', result.access);
      navigate('/dashboard');
    } catch (err) {
      setError('Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVerificationCode('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
        if (result.access) {
          localStorage.setItem('token', result.access);
          navigate('/dashboard');
        }
      } else {
        result = await register(formData.email, formData.password, formData.firstName, formData.lastName);
      }
      
      if (result.verification_code) {
        setVerificationCode(result.verification_code);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-4 w-24 h-24 mx-auto mb-6 shadow-lg logo-container float-animation">
            <img 
              src="/bpay-logo.jpg/5782897843587714011_120.jpg" 
              alt="BPAY Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">BPAY</h1>
          <p className="text-gray-600 mb-4">
            {isLogin ? 'Welcome back to your wallet' : 'Create your multi-currency wallet'}
          </p>
          <div className="flex justify-center space-x-3 text-sm">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium currency-badge">KES</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium currency-badge">NGN</span>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium currency-badge">BTC</span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium currency-badge">ETH</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Tab Switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <i className="bi bi-exclamation-triangle-fill text-red-400 mr-3"></i>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {verificationCode && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex items-start">
                <i className="bi bi-check-circle-fill text-green-400 mr-3 mt-0.5"></i>
                <div className="flex-1">
                  <h3 className="text-green-800 font-medium mb-2">Registration Successful!</h3>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-sm text-gray-600 mb-2">Your verification code:</p>
                    <div className="font-mono text-lg text-gray-900 bg-gray-50 px-3 py-2 rounded border text-center">
                      {verificationCode}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <i className="bi bi-person absolute left-3 top-3 text-gray-400"></i>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="relative">
                  <i className="bi bi-person absolute left-3 top-3 text-gray-400"></i>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="relative">
              <i className="bi bi-envelope absolute left-3 top-3 text-gray-400"></i>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="relative">
              <i className="bi bi-lock absolute left-3 top-3 text-gray-400"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <i className={`bi ${isLogin ? 'bi-box-arrow-in-right' : 'bi-person-plus'} mr-2`}></i>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>
          
          {/* Google Sign In */}
          <div className="mt-6">
            <div id="google-signin-button" className="w-full"></div>
          </div>
        </div>

        {/* System Features */}
        <div className={`bg-white rounded-xl p-6 mt-6 border border-gray-200 transition-all duration-1000 transform ${
          showFeatures ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">BPAY Wallet Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Deposit Section */}
            <div className="bg-green-50 rounded-lg p-4 feature-card">
              <div className="flex items-center mb-3">
                <i className="bi bi-arrow-down-circle text-green-600 text-xl mr-2 float-animation"></i>
                <h4 className="font-medium text-green-800">Deposits Accepted</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <i className="bi bi-currency-exchange text-green-600 mr-2"></i>
                  <span className="text-green-700">Kenyan Shilling (KES)</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="bi bi-currency-exchange text-green-600 mr-2"></i>
                  <span className="text-green-700">Nigerian Naira (NGN)</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="bi bi-currency-bitcoin text-green-600 mr-2"></i>
                  <span className="text-green-700">Bitcoin (BTC)</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="bi bi-currency-bitcoin text-green-600 mr-2"></i>
                  <span className="text-green-700">Ethereum (ETH)</span>
                </div>
              </div>
            </div>

            {/* Withdrawal Section */}
            <div className="bg-blue-50 rounded-lg p-4 feature-card">
              <div className="flex items-center mb-3">
                <i className="bi bi-arrow-up-circle text-blue-600 text-xl mr-2 float-animation"></i>
                <h4 className="font-medium text-blue-800">Withdrawals Available</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <i className="bi bi-bank text-blue-600 mr-2"></i>
                  <span className="text-blue-700">Kenyan Shilling (KES)</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="bi bi-bank text-blue-600 mr-2"></i>
                  <span className="text-blue-700">Nigerian Naira (NGN)</span>
                </div>
                <div className="text-xs text-blue-600 mt-2 italic">
                  Crypto converts to fiat for withdrawal
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-800 mb-3 text-center">Integrated Payment Gateways</h4>
            <div className="flex justify-center space-x-6">
              <div className="text-center payment-icon">
                <div className="bg-orange-100 rounded-lg p-3 mb-2">
                  <i className="bi bi-credit-card text-orange-600 text-2xl"></i>
                </div>
                <span className="text-xs text-gray-600">Flutterwave</span>
                <div className="text-xs text-orange-600 font-medium">NGN</div>
              </div>
              <div className="text-center payment-icon">
                <div className="bg-green-100 rounded-lg p-3 mb-2">
                  <i className="bi bi-phone text-green-600 text-2xl"></i>
                </div>
                <span className="text-xs text-gray-600">SasaPay</span>
                <div className="text-xs text-green-600 font-medium">KES/M-Pesa</div>
              </div>
              <div className="text-center payment-icon">
                <div className="bg-yellow-100 rounded-lg p-3 mb-2">
                  <i className="bi bi-shield-check text-yellow-600 text-2xl"></i>
                </div>
                <span className="text-xs text-gray-600">Crypto</span>
                <div className="text-xs text-yellow-600 font-medium">BTC/ETH</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2">
            <i className="bi bi-shield-fill-check text-green-600 mr-2"></i>
            <span className="text-sm text-gray-700 font-medium">KYC Compliant & Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;