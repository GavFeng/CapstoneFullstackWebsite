import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";

import './LoginSignup.css';

const Signup = () => {
  const { t } = useTranslation();

  /* ---------- STATE ---------- */
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '', 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  /* ---------- HANDLERS ---------- */

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError(t('signup.errorMismatch'));
    }

    setLoading(true);

    try {
      await register(
        form.name.trim(),
        form.username.trim(),
        form.email.trim(),
        form.password
      );
    } catch (err) {
      setError(err || t('signup.errorFailed'));
    } finally {
      setLoading(false);
    }
  };

  /* ----------  JSX ----------  */
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('signup.title')}</h2>
        <p className="auth-subtitle">{t('signup.subtitle')}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">{t('signup.nameLabel')}</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">{t('signup.usernameLabel')}</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="johndoe123"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('signup.emailLabel')}</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('signup.passwordLabel')}</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('signup.confirmPasswordLabel')}</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? t('signup.creatingAccount') : t('signup.signUpBtn')}
          </button>
        </form>

        <p className="auth-link">
          {t('signup.haveAccount')}{' '}
          <Link to="/login">{t('signup.signInLink')}</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup