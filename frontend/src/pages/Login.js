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
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-3xl">BP</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              The Future of <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">African</span> Payments
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
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400 text-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span>Instant Transfers</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Real-time Rates</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Section */}
      <div className="flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              {mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Welcome Back'}
            </h2>
            <p className="mt-2 text-slate-400">
              {mode === 'register' ? 'Join thousands of users sending money across Africa' : 
               mode === 'forgot' ? 'Reset your password to continue' : 
               'Sign in to your BPAY account'}
            </p>
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
            <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 mt-4">
              <p className="text-sm text-green-300 font-medium">📧 Check Your Email</p>
              <p className="text-sm text-green-200 mt-1">We sent a 6-digit code to your email</p>
              <p className="text-xs text-green-300 mt-1">Code expires in 5 minutes</p>
            </div>
            <p className="text-xs text-slate-400 mt-2">Email: {formData.email}</p>
          </div>
          <form onSubmit={handleCodeSubmit}>
            <div className="mb-4">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full p-4 bg-slate-800 border border-slate-600 rounded-lg text-center text-2xl tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
                maxLength="6"
                required
              />
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