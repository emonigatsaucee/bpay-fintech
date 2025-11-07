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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #334155',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '0.5rem' 
          }}>
            BPAY
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
            Multi-Currency Wallet System
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ 
              backgroundColor: '#16a34a', 
              color: 'white', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px', 
              fontSize: '0.75rem' 
            }}>KES</span>
            <span style={{ 
              backgroundColor: '#2563eb', 
              color: 'white', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px', 
              fontSize: '0.75rem' 
            }}>NGN</span>
            <span style={{ 
              backgroundColor: '#ca8a04', 
              color: 'white', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px', 
              fontSize: '0.75rem' 
            }}>BTC</span>
            <span style={{ 
              backgroundColor: '#7c3aed', 
              color: 'white', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px', 
              fontSize: '0.75rem' 
            }}>ETH</span>
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

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Supports deposits in KES, NGN, BTC & ETH
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;