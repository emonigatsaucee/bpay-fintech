import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', new_password: '', confirmPassword: '', confirmNewPassword: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const startResendCooldown = () => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      // Initialize Google OAuth
      if (!window.google) {
        toast.error('Google OAuth not loaded. Please refresh the page.');
        return;
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
        scope: 'email profile',
        callback: async (response) => {
          if (response.access_token) {
            try {
              const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8000' : '';
              const authResponse = await fetch(`${baseUrl}/api/auth/google/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: response.access_token }),
              });

              const data = await authResponse.json();

              if (authResponse.ok) {
                localStorage.setItem('token', data.access);
                toast.success(`Welcome ${data.user.name}!`);
                navigate('/');
                window.location.reload();
              } else {
                toast.error(data.error || 'Google authentication failed');
              }
            } catch (error) {
              toast.error('Network error during Google authentication');
            }
          } else {
            toast.error('Google authentication cancelled');
          }
          setLoading(false);
        },
      });

      client.requestAccessToken();
    } catch (error) {
      toast.error('Failed to initialize Google authentication');
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    
    // Password confirmation checks
    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (mode === 'forgot' && formData.new_password !== formData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      let endpoint, payload;
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8000' : '';
      
      if (mode === 'register') {
        endpoint = `${baseUrl}/api/auth/register/`;
        payload = { email: formData.email, password: formData.password, full_name: formData.full_name };
      } else if (mode === 'forgot') {
        endpoint = `${baseUrl}/api/auth/forgot-password/`;
        payload = { email: formData.email };
      } else {
        endpoint = `${baseUrl}/api/auth/login-code/`;
        payload = { email: formData.email, password: formData.password };
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(mode === 'register' ? 'Verification code sent to your email' : 
                     mode === 'forgot' ? 'Reset code sent to your email' : 
                     'Verification code sent to your email');
        setStep(2);
        startResendCooldown();
      } else {
        toast.error(data.error || 'Request failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint, payload;
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8000' : '';
      
      if (mode === 'register') {
        endpoint = `${baseUrl}/api/auth/verify-registration/`;
        payload = { email: formData.email, code: verificationCode };
      } else if (mode === 'forgot') {
        endpoint = `${baseUrl}/api/auth/reset-password/`;
        payload = { email: formData.email, code: verificationCode, new_password: formData.new_password };
      } else {
        endpoint = `${baseUrl}/api/auth/verify-login/`;
        payload = { email: formData.email, code: verificationCode };
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        if (mode === 'register') {
          toast.success('Registration successful! Please login.');
          setMode('login');
          setStep(1);
          setFormData({ email: formData.email, password: '', full_name: '', new_password: '', confirmPassword: '' });
          setVerificationCode('');
        } else if (mode === 'forgot') {
          toast.success('Password reset successful! Please login.');
          setMode('login');
          setStep(1);
          setFormData({ email: formData.email, password: '', full_name: '', new_password: '', confirmPassword: '' });
          setVerificationCode('');
        } else {
          const data = await response.json();
          localStorage.setItem('token', data.access);
          toast.success('Login successful');
          navigate('/');
          window.location.reload();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Invalid verification code');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      let endpoint, payload;
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8000' : '';
      
      if (mode === 'register') {
        endpoint = `${baseUrl}/api/auth/register/`;
        payload = { email: formData.email, password: formData.password, full_name: formData.full_name };
      } else if (mode === 'forgot') {
        endpoint = `${baseUrl}/api/auth/forgot-password/`;
        payload = { email: formData.email };
      } else {
        endpoint = `${baseUrl}/api/auth/login-code/`;
        payload = { email: formData.email, password: formData.password };
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        toast.success('New code sent to your email');
        startResendCooldown();
      } else {
        toast.error('Failed to resend code');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <img 
                src="/static/bpay-logo.jpg/5782897843587714011_120.jpg" 
                alt="BPAY" 
                className="w-20 h-20 object-contain rounded-xl"
                onError={(e) => {
                  e.target.outerHTML = '<div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"><span class="text-white font-bold text-3xl">BP</span></div>';
                }}
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 relative">
              <span className="relative z-10">
                The Future of{' '}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                  African
                </span>{' '}
                Payments
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl -z-10 animate-pulse"></div>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Trade crypto, send money across borders, and manage multiple currencies - all in one secure platform built for Africa.
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg" alt="Crypto" className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Crypto Trading</h3>
                <p className="text-slate-400 text-sm">Buy, sell & convert Bitcoin, Ethereum, USDT instantly</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13z"/>
                    <path d="M7 8h10M7 12h4m-4 4h4"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Multi-Currency Wallets</h3>
                <p className="text-slate-400 text-sm">Manage NGN, KES, BTC, ETH & USDT in one place</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure & Verified</h3>
                <p className="text-slate-400 text-sm">KYC compliance with advanced security protocols</p>
              </div>
            </div>
            
            {/* Trust Indicators with Animation */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400 text-sm">
              <div className="flex items-center space-x-2 group hover:text-yellow-300 transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-yellow-400 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span>Instant Transfers</span>
              </div>
              <div className="flex items-center space-x-2 group hover:text-green-300 transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-green-400 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center space-x-2 group hover:text-blue-300 transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-blue-400 group-hover:animate-spin" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Real-time Rates</span>
              </div>
              <div className="flex items-center space-x-2 group hover:text-purple-300 transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-purple-400 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span>24/7 Support</span>
              </div>
            </div>
            
            {/* Live Stats Counter */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                <div className="text-2xl font-bold text-blue-400 animate-pulse">50K+</div>
                <div className="text-xs text-slate-400">Active Users</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                <div className="text-2xl font-bold text-green-400 animate-pulse">₦2.5B</div>
                <div className="text-xs text-slate-400">Processed</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                <div className="text-2xl font-bold text-purple-400 animate-pulse">15</div>
                <div className="text-xs text-slate-400">Countries</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                <div className="text-2xl font-bold text-yellow-400 animate-pulse">99.9%</div>
                <div className="text-xs text-slate-400">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Section */}
      <div className="flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 animate-pulse"></div>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl rounded-full"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-2">
                {mode === 'register' ? '🚀 Create Account' : mode === 'forgot' ? '🔐 Reset Password' : '👋 Welcome Back'}
              </h2>
              <p className="mt-2 text-slate-400">
                {mode === 'register' ? 'Join thousands of users sending money across Africa' : 
                 mode === 'forgot' ? 'Reset your password to continue' : 
                 'Sign in to your BPAY account'}
              </p>
              {mode === 'login' && (
                <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Secure login with 2FA</span>
                </div>
              )}
            </div>
          </div>
        
        {step === 1 ? (
        <form className="mt-8 space-y-6" onSubmit={handleCredentialsSubmit}>
          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                />
              </div>
            )}
            <div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email address"
              />
            </div>
            {mode !== 'forgot' && (
              <>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
                {mode === 'register' && (
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-slate-600 focus:ring-blue-500'
                      }`}
                      placeholder="Confirm Password"
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 
             mode === 'register' ? 'Create Account' :
             mode === 'forgot' ? 'Send Reset Code' : 'Send Verification Code'}
          </button>
          
          {mode !== 'forgot' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-slate-400">Or continue with</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg font-medium transition-all border border-gray-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
              </button>
            </>
          )}
          
          <div className="text-center space-y-2">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Forgot Password?
                </button>
                <div className="text-slate-400 text-sm">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}
            {(mode === 'register' || mode === 'forgot') && (
              <div className="text-slate-400 text-sm">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Sign in
                </button>
              </div>
            )}
          </div>
        </form>
        ) : (
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-medium text-white">
              {mode === 'forgot' ? 'Enter Reset Code' : 'Enter Verification Code'}
            </h3>
            <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border border-green-700 rounded-lg p-4 mt-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-blue-400/10 animate-pulse"></div>
              <div className="relative">
                <p className="text-sm text-green-300 font-medium flex items-center">
                  <span className="animate-bounce mr-2">📧</span> Check Your Email
                </p>
                <p className="text-sm text-green-200 mt-1">We sent a 6-digit code to your email</p>
                <p className="text-xs text-green-300 mt-1 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Code expires in 5 minutes
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Email: {formData.email}</p>
          </div>
          <form onSubmit={handleCodeSubmit}>
            <div className="mb-4">
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    value={verificationCode[index] || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 1) {
                        const newCode = verificationCode.split('');
                        newCode[index] = value;
                        setVerificationCode(newCode.join(''));
                        
                        // Auto-focus next input
                        if (value && index < 5) {
                          const nextInput = e.target.parentNode.children[index + 1];
                          if (nextInput) nextInput.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace
                      if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
                        const prevInput = e.target.parentNode.children[index - 1];
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    className="w-12 h-12 bg-slate-800 border border-slate-600 rounded-lg text-center text-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    maxLength="1"
                  />
                ))}
              </div>
            </div>
            {mode === 'forgot' && (
              <>
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={formData.new_password}
                      onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="New Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      <i className={`bi bi-eye${showNewPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={formData.confirmNewPassword}
                      onChange={(e) => setFormData({...formData, confirmNewPassword: e.target.value})}
                      className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                        formData.confirmNewPassword && formData.new_password !== formData.confirmNewPassword 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-slate-600 focus:ring-blue-500'
                      }`}
                      placeholder="Confirm New Password"
                      required
                    />
                    {formData.confirmNewPassword && formData.new_password !== formData.confirmNewPassword && (
                      <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="flex space-x-2 mb-4">
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6 || (mode === 'forgot' && (!formData.new_password || !formData.confirmNewPassword || formData.new_password !== formData.confirmNewPassword))}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : mode === 'forgot' ? 'Reset Password' : 'Verify & Login'}
              </button>
              <button
                type="button"
                onClick={() => { setStep(1); setVerificationCode(''); setResendCooldown(0); }}
                className="bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg font-medium transition-all"
              >
                Back
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading || resendCooldown > 0}
                className="text-sm text-blue-400 hover:text-blue-300 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                {resendLoading ? 'Sending...' : 
                 resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 
                 'Resend Code'}
              </button>
            </div>
          </form>
        </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Login;
