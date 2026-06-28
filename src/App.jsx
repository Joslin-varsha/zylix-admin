import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

// Simple hardcoded admin credentials (for local/private use)
const ADMIN_EMAIL = 'joslinvarsha55@gmail.com';
const ADMIN_PASSWORD = 'zylix@admin2024';
const SESSION_KEY = 'zylix_admin_session';

export default function App() {
  // Restore session from localStorage so refresh keeps the admin logged in
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem(SESSION_KEY) === 'authenticated';
  });
  const [loginError, setLoginError] = useState('');

  const handleLogin = (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(SESSION_KEY, 'authenticated');
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} error={loginError} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}
