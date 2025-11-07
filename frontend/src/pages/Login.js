import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, googleAuth } from '../services/api';

// Force rebuild - Dark theme version

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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 bg-opacity-10 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-500 bg-opacity-10 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-500 bg-opacity-10 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-32 right-10 w-12 h-12 bg-yellow-500 bg-opacity-10 rounded-full animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
      </div>
      <div className="max-w-md w-full relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-4 w-24 h-24 mx-auto mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300 animate-pulse">
            <img 
              src="/bpay-logo.jpg/5782897843587714011_120.jpg" 
              alt="BPAY Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">BPAY</h1>
          <p className="text-slate-400 mb-4">
            {isLogin ? 'Welcome back to your wallet' : 'Create your multi-currency wallet'}
          </p>
          <div className="flex justify-center space-x-3 text-sm">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium transform hover:scale-110 transition-all duration-300 animate-bounce" style={{animationDelay: '0.1s'}}>KES</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium transform hover:scale-110 transition-all duration-300 animate-bounce" style={{animationDelay: '0.2s'}}>NGN</span>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium transform hover:scale-110 transition-all duration-300 animate-bounce" style={{animationDelay: '0.3s'}}>BTC</span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium transform hover:scale-110 transition-all duration-300 animate-bounce" style={{animationDelay: '0.4s'}}>ETH</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700 transform hover:shadow-2xl transition-all duration-300">
          {/* Tab Switcher */}
          <div className="flex bg-slate-700 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin 
                  ? 'bg-slate-800 text-blue-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin 
                  ? 'bg-slate-800 text-blue-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-900 bg-opacity-50 border-l-4 border-red-400 p-4 mb-6 rounded">
              <div className="flex">
                <i className="bi bi-exclamation-triangle-fill text-red-400 mr-3"></i>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {verificationCode && (
            <div className="bg-green-900 bg-opacity-50 border-l-4 border-green-400 p-4 mb-6 rounded">
              <div className="flex items-start">
                <i className="bi bi-check-circle-fill text-green-400 mr-3 mt-0.5"></i>
                <div className="flex-1">
                  <h3 className="text-green-300 font-medium mb-2">Registration Successful!</h3>
                  <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                    <p className="text-sm text-slate-400 mb-2">Your verification code:</p>
                    <div className="font-mono text-lg text-white bg-slate-800 px-3 py-2 rounded border border-slate-600 text-center">
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
                  <i className="bi bi-person absolute left-3 top-3 text-slate-400"></i>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="relative">
                  <i className="bi bi-person absolute left-3 top-3 text-slate-400"></i>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="relative">
              <i className="bi bi-envelope absolute left-3 top-3 text-slate-400"></i>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="relative">
              <i className="bi bi-lock absolute left-3 top-3 text-slate-400"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Forgot Password Link */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={() => alert('Forgot password feature coming soon!')}
                >
                  Forgot your password?
                </button>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
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
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-slate-800 text-slate-400">Or continue with</span>
              </div>
            </div>
          </div>
          
          {/* Google Sign In */}
          <div className="mt-6">
            <div id="google-signin-button" className="w-full"></div>
          </div>
        </div>

        {/* System Features */}
        <div className={`bg-slate-800 rounded-xl p-6 mt-6 border border-slate-700 shadow-lg transition-all duration-1000 transform ${
          showFeatures ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        }`}>
          <h3 className="text-lg font-semibold text-white mb-4 text-center">BPAY Wallet Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Deposit Section */}
            <div className="bg-green-900 bg-opacity-30 rounded-lg p-4 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-green-800">
              <div className="flex items-center mb-3">
                <i className="bi bi-arrow-down-circle text-green-400 text-xl mr-2 animate-pulse"></i>
                <h4 className="font-medium text-green-300">Deposits Accepted</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <i className="bi bi-currency-exchange text-green-400 mr-2"></i>
                  <span className="text-green-300">Kenyan Shilling (KES)</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="bi bi-currency-exchange text-green-400 mr-2"></i>
                  <span className="text-green-300">Nigerian Naira (NGN)</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="bi bi-currency-bitcoin text-green-400 mr-2"></i>
                  <span className="text-green-300">Bitcoin (BTC)</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="bi bi-currency-bitcoin text-green-400 mr-2"></i>
                  <span className="text-green-300">Ethereum (ETH)</span>
                </div>
              </div>
            </div>

            {/* Withdrawal Section */}
            <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-blue-800">
              <div className="flex items-center mb-3">
                <i className="bi bi-arrow-up-circle text-blue-400 text-xl mr-2 animate-pulse"></i>
                <h4 className="font-medium text-blue-300">Withdrawals Available</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <i className="bi bi-bank text-blue-400 mr-2"></i>
                  <span className="text-blue-300">Kenyan Shilling (KES)</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="bi bi-bank text-blue-400 mr-2"></i>
                  <span className="text-blue-300">Nigerian Naira (NGN)</span>
                </div>
                <div className="text-xs text-blue-400 mt-2 italic">
                  Crypto converts to fiat for withdrawal
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t border-slate-600 pt-4">
            <h4 className="font-medium text-white mb-3 text-center">Integrated Payment Gateways</h4>
            <div className="flex justify-center space-x-6">
              <div className="text-center transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="bg-orange-900 bg-opacity-50 rounded-lg p-3 mb-2 shadow-md hover:shadow-lg transition-shadow">
                  <i className="bi bi-credit-card text-orange-400 text-2xl animate-pulse"></i>
                </div>
                <span className="text-xs text-slate-400">Flutterwave</span>
                <div className="text-xs text-orange-400 font-medium">NGN</div>
              </div>
              <div className="text-center transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="bg-green-900 bg-opacity-50 rounded-lg p-3 mb-2 shadow-md hover:shadow-lg transition-shadow">
                  <i className="bi bi-phone text-green-400 text-2xl animate-pulse"></i>
                </div>
                <span className="text-xs text-slate-400">SasaPay</span>
                <div className="text-xs text-green-400 font-medium">KES/M-Pesa</div>
              </div>
              <div className="text-center transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="bg-yellow-900 bg-opacity-50 rounded-lg p-3 mb-2 shadow-md hover:shadow-lg transition-shadow">
                  <i className="bi bi-shield-check text-yellow-400 text-2xl animate-pulse"></i>
                </div>
                <span className="text-xs text-slate-400">Crypto</span>
                <div className="text-xs text-yellow-400 font-medium">BTC/ETH</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center bg-slate-700 rounded-full px-4 py-2 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg border border-slate-600">
            <i className="bi bi-shield-fill-check text-green-400 mr-2 animate-pulse"></i>
            <span className="text-sm text-slate-300 font-medium">KYC Compliant & Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;