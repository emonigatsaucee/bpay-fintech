import React, { useState, useEffect } from 'react';
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
  const [currentFeature, setCurrentFeature] = useState(0);
  const navigate = useNavigate();

  const features = [
    { 
      title: 'Multi-Currency Wallet', 
      desc: 'Manage KES, NGN, BTC, ETH & USDT in one secure platform',
      icon: 'fas fa-wallet',
      color: '#10b981'
    },
    { 
      title: 'Instant Deposits', 
      desc: 'M-Pesa, Bank transfers & Crypto deposits in seconds',
      icon: 'fas fa-bolt',
      color: '#3b82f6'
    },
    { 
      title: 'Secure Withdrawals', 
      desc: 'Withdraw to KES & NGN bank accounts safely',
      icon: 'fas fa-shield-alt',
      color: '#f59e0b'
    },
    { 
      title: 'Real-time Exchange', 
      desc: 'Live crypto rates with instant conversion',
      icon: 'fas fa-exchange-alt',
      color: '#8b5cf6'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  const handleForgotPassword = () => {
    const email = prompt('Enter your email address:');
    if (email) {
      // TODO: Implement actual password reset API call
      alert(`Password reset instructions will be sent to ${email}`);
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth
    alert('Google Sign-In will be implemented with proper OAuth setup');
  };

  return (
    <>
      {/* CDN Links */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      <div style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
          `,
          animation: 'float 20s ease-in-out infinite'
        }}></div>

        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(5deg); }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            .feature-card {
              transition: all 0.3s ease;
            }
            .feature-card:hover {
              transform: translateY(-5px);
            }
          `}
        </style>

        {/* Left Side - Features */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '2rem 4rem',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Logo Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '3rem',
            animation: 'slideUp 0.8s ease-out'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#3b82f6',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
              animation: 'pulse 2s infinite'
            }}>
              <span style={{
                color: 'white',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                fontFamily: 'Arial, sans-serif'
              }}>
                B
              </span>
            </div>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                BPAY
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
                fontSize: '0.9rem'
              }}>
                Multi-Currency Wallet
              </p>
            </div>
          </div>

          {/* Main Heading */}
          <div style={{
            marginBottom: '2rem',
            animation: 'slideUp 1s ease-out'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 1rem 0',
              lineHeight: '1.2',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)'
            }}>
              Your Gateway to<br />Digital Finance
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              lineHeight: '1.6'
            }}>
              Seamlessly manage multiple currencies with advanced security and real-time exchange rates.
            </p>
          </div>

          {/* Rotating Features */}
          <div style={{
            height: '200px',
            marginBottom: '2rem'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card"
                style={{
                  display: currentFeature === index ? 'block' : 'none',
                  animation: currentFeature === index ? 'fadeIn 0.5s ease-out' : 'none',
                  background: 'rgba(30, 41, 59, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '2rem',
                  border: '1px solid rgba(51, 65, 85, 0.5)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: feature.color,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem'
                  }}>
                    <i className={feature.icon} style={{ color: 'white', fontSize: '1.2rem' }}></i>
                  </div>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    margin: 0
                  }}>
                    {feature.title}
                  </h3>
                </div>
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '1rem',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
            animation: 'slideUp 1.2s ease-out'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>5</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Currencies</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>24/7</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Support</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>2</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Gateways</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>100%</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Secure</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div style={{
          width: '500px',
          background: '#1e293b',
          border: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem',
          position: 'relative',
          zIndex: 2,
          boxShadow: '-10px 0 50px rgba(0,0,0,0.3)'
        }}>
          {/* Form Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
            animation: 'slideUp 0.6s ease-out'
          }}>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 0.5rem 0'
            }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p style={{
              color: '#94a3b8',
              margin: 0,
              fontSize: '1rem'
            }}>
              {isLogin ? 'Sign in to your BPAY account' : 'Join thousands of users worldwide'}
            </p>
          </div>

          {/* Currency Support Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <span style={{
              background: '#16a34a',
              color: 'white',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <img src="https://flagcdn.com/w20/ke.png" alt="KES" style={{width: '16px', height: '12px'}} /> KES
            </span>
            <span style={{
              background: '#2563eb',
              color: 'white',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <img src="https://flagcdn.com/w20/ng.png" alt="NGN" style={{width: '16px', height: '12px'}} /> NGN
            </span>
            <span style={{
              background: '#f59e0b',
              color: 'white',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg" alt="BTC" style={{width: '16px', height: '16px'}} /> BTC
            </span>
            <span style={{
              background: '#8b5cf6',
              color: 'white',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg" alt="ETH" style={{width: '16px', height: '16px'}} /> ETH
            </span>
            <span style={{
              background: '#10b981',
              color: 'white',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg" alt="USDT" style={{width: '16px', height: '16px'}} /> USDT
            </span>
          </div>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: '#334155',
            borderRadius: '12px',
            padding: '0.25rem',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isLogin ? '#1e293b' : 'transparent',
                color: isLogin ? '#60a5fa' : '#94a3b8',
                boxShadow: isLogin ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: !isLogin ? '#1e293b' : 'transparent',
                color: !isLogin ? '#60a5fa' : '#94a3b8',
                boxShadow: !isLogin ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
              <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLogin && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-user" style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}></i>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 2.5rem',
                      background: '#334155',
                      border: '2px solid #475569',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#475569'}
                    required
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-user" style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}></i>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 2.5rem',
                      background: '#334155',
                      border: '2px solid #475569',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#475569'}
                    required
                  />
                </div>
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <i className="fas fa-envelope" style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}></i>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 2.5rem',
                  background: '#334155',
                  border: '2px solid #475569',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#475569'}
                required
              />
            </div>

            <div style={{ position: 'relative' }}>
              <i className="fas fa-lock" style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 2.5rem',
                  background: '#334155',
                  border: '2px solid #475569',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#475569'}
                required
              />
            </div>

            {isLogin && (
              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#60a5fa',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '1rem',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Google Sign-In */}
          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#475569' }}></div>
              <span style={{ padding: '0 1rem', color: '#94a3b8', fontSize: '0.9rem' }}>Or continue with</span>
              <div style={{ flex: 1, height: '1px', background: '#475569' }}></div>
            </div>
            <button
              type="button"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'white',
                border: '2px solid #475569',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#f9fafb'}
              onMouseOut={(e) => e.target.style.background = 'white'}
              onClick={handleGoogleSignIn}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          {/* Footer Info */}
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: '#334155',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>
                <i className="fas fa-check-circle"></i> Deposits: KES, NGN, BTC, ETH, USDT
              </span>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: '600' }}>
                <i className="fas fa-university"></i> Withdrawals: KES & NGN only
              </span>
            </div>
            <div>
              <span style={{ color: '#60a5fa', fontSize: '0.9rem', fontWeight: '600' }}>
                <i className="fas fa-shield-alt"></i> Bank-grade security
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;