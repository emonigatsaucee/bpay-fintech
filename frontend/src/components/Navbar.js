import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Navbar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/bpay-logo.jpg/5782897843587714011_120.jpg" 
              alt="BPAY" 
              className="w-12 h-12 object-contain group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.outerHTML = '<div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform"><span class="text-white font-bold text-sm">BP</span></div>';
              }}
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              BPAY
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { path: '/', icon: 'speedometer2', label: 'Dashboard' },
              { path: '/transactions', icon: 'arrow-left-right', label: 'Transactions' }
            ].map(({ path, icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(path)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <i className={`bi bi-${icon}`}></i>
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Profile & Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Profile Dropdown - Desktop */}
            <div className="hidden md:block relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <i className="bi bi-person text-white text-sm"></i>
                </div>
                <i className={`bi bi-chevron-${profileOpen ? 'up' : 'down'} text-xs transition-transform`}></i>
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="w-full px-4 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center space-x-2"
                    >
                      <i className="bi bi-person-gear"></i>
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center space-x-2"
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              <i className={`bi bi-${isOpen ? 'x' : 'list'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-700/50">
            <div className="py-4 space-y-2">
              {[
                { path: '/', icon: 'speedometer2', label: 'Dashboard' },
                { path: '/transactions', icon: 'arrow-left-right', label: 'Transactions' }
              ].map(({ path, icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center space-x-3 ${
                    isActive(path)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <i className={`bi bi-${icon}`}></i>
                  <span>{label}</span>
                </Link>
              ))}
              
              <div className="border-t border-slate-700/50 pt-2 mt-2">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all flex items-center space-x-3"
                >
                  <i className="bi bi-person-gear"></i>
                  <span>Profile</span>
                </Link>
                <button
                  onClick={logout}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all flex items-center space-x-3"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
