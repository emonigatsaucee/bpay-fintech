import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';

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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl p-8 w-full max-w-md border border-slate-700 shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-4">
            <img 
              src="/bpay-logo.jpg/5782897843587714011_120.jpg" 
              alt="BPAY" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">BPAY</h1>
          <p className="text-slate-400 mb-4">Multi-Currency Wallet System</p>
          <div className="flex justify-center space-x-2">
            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">KES</span>
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">NGN</span>
            <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium">BTC</span>
            <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">ETH</span>
          </div>
        </div>

        <div className="flex bg-slate-700 rounded-lg p-1 mb-6">
          <button
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

        {error && (
          <div className="bg-red-900 bg-opacity-50 border-l-4 border-red-400 p-4 mb-6 rounded">
            <div className="flex">
              <i className="bi bi-exclamation-triangle-fill text-red-400 mr-3"></i>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          
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
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Supports deposits in KES, NGN, BTC & ETH
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Withdrawals available in KES & NGN only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;