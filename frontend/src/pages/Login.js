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
    toast.info('Google OAuth coming soon! Use email login for now.');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      {/* Main Auth Card */}
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 shadow-2xl relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <img 
              src="/static/bpay-logo.jpg/5782897843587714011_120.jpg" 
              alt="BPAY" 
              className="w-16 h-16 object-contain rounded-xl"
              onError={(e) => {
                e.target.outerHTML = '<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"><span class="text-white font-bold text-2xl">BP</span></div>';
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Welcome Back'}
          </h1>
          <p className="text-slate-400 text-sm">
            {mode === 'register' ? 'Join the future of African payments' : 
             mode === 'forgot' ? 'Reset your password to continue' : 
             'Sign in to your BPAY account'}
          </p>
        </div>
        
        {step === 1 ? (
        <form className="space-y-4" onSubmit={handleCredentialsSubmit}>
          <div className="space-y-3">
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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
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
                className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg font-semibold transition-all border border-gray-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
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
          
          <div className="text-center space-y-3 pt-2">
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
  );
};

export default Login;
