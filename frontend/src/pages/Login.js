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
  const [showFeatures, setShowFeatures] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const navigate = useNavigate();

  const features = [
    { title: 'Multi-Currency Support', desc: 'KES, NGN, BTC & ETH in one wallet', icon: '💰' },
    { title: 'Instant Deposits', desc: 'M-Pesa, Bank Transfer & Crypto', icon: '⚡' },
    { title: 'Secure Withdrawals', desc: 'KES & NGN to your bank account', icon: '🔒' },
    { title: 'Real-time Rates', desc: 'Live crypto exchange rates', icon: '📈' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowFeatures(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 3000);
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '100px',
        height: '100px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        width: '80px',
        height: '80px',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '20%',
        width: '120px',
        height: '120px',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderRadius: '50%',
        animation: 'float 7s ease-in-out infinite'
      }}></div>
      
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
      <div style={{
        display: 'flex',
        gap: '2rem',
        width: '100%',
        maxWidth: '1200px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Features Section */}
        <div style={{
          flex: 1,
          display: showFeatures ? 'block' : 'none',
          animation: showFeatures ? 'slideIn 1s ease-out' : 'none'
        }}>
          <div style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Welcome to BPAY
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.1rem' }}>
              The most advanced multi-currency wallet system
            </p>
            
            {/* Rotating Features */}
            <div style={{ minHeight: '120px' }}>
              {features.map((feature, index) => (
                <div key={index} style={{
                  display: currentFeature === index ? 'block' : 'none',
                  animation: currentFeature === index ? 'slideIn 0.5s ease-out' : 'none'
                }}>
                  <div style={{
                    backgroundColor: 'rgba(51, 65, 85, 0.5)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(71, 85, 105, 0.5)'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
                    <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* System Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>4</div>
                <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>Currencies</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 'bold' }}>24/7</div>
                <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>Support</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 'bold' }}>2</div>
                <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>Gateways</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: 'bold' }}>100%</div>
                <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>Secure</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Login Form */}
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          borderRadius: '20px',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(15px)',
          animation: 'slideIn 0.8s ease-out'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'white',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite'
            }}>
              <img 
                src="/bpay-logo.jpg/5782897843587714011_120.jpg" 
                alt="BPAY" 
                style={{ width: '60px', height: '60px', objectFit: 'contain' }}
              />
            </div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              BPAY
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '1rem' }}>
              Your Gateway to Digital Finance
            </p>
            
            {/* Currency Support */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                color: '#10b981',
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>KES Deposits</div>
              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid #3b82f6',
                color: '#3b82f6',
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>NGN Deposits</div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.5rem'
            }}>
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid #f59e0b',
                color: '#f59e0b',
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>BTC Deposits</div>
              <div style={{
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid #8b5cf6',
                color: '#8b5cf6',
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>ETH Deposits</div>
            </div>
          </div>

        <div style={{ 
          display: 'flex', 
          backgroundColor: '#334155', 
          borderRadius: '8px', 
          padding: '0.25rem',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isLogin ? '#1e293b' : 'transparent',
              color: isLogin ? '#60a5fa' : '#94a3b8'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: !isLogin ? '#1e293b' : 'transparent',
              color: !isLogin ? '#60a5fa' : '#94a3b8'
            }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(127, 29, 29, 0.5)',
            borderLeft: '4px solid #f87171',
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '4px'
          }}>
            <p style={{ color: '#fca5a5', fontSize: '0.875rem', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem'
                }}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem'
                }}
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
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#334155',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#334155',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}
            required
          />
          
          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
              <button 
                type="button" 
                style={{
                  fontSize: '0.875rem',
                  color: '#60a5fa',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => alert('Forgot password feature coming soon!')}
              >
                Forgot your password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontWeight: '500',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              fontSize: '1rem'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: 'rgba(51, 65, 85, 0.3)',
            borderRadius: '12px',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
                ✓ Deposits: KES, NGN, BTC, ETH
              </span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#f59e0b', fontSize: '0.875rem', fontWeight: '600' }}>
                ✓ Withdrawals: KES & NGN only
              </span>
            </div>
            <div>
              <span style={{ color: '#8b5cf6', fontSize: '0.875rem', fontWeight: '600' }}>
                ✓ Real-time currency conversion
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;