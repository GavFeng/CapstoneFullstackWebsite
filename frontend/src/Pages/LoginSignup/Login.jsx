import React, { useContext, useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { JigContext } from "../../Context/JigContext";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import './LoginSignup.css'

const Login = () => {
  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { loadCart } = useContext(JigContext);

  const from = location.state?.from || "/";

  /* ---------- STATE ---------- */
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [logoutMessage, setLogoutMessage] = useState(location.state?.message || '');

  /* ---------- EFFECTS ---------- */

  useEffect(() => {
    if (logoutMessage) {
      const timer = setTimeout(() => {
        setLogoutMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [logoutMessage]);

  /* ---------- HANDLERS ---------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      await loadCart(true);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ----------  JSX ----------  */
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Login */}
        <h2>{t('login.title')}</h2>
        <p className="auth-subtitle">{t('login.subtitle')}</p>

        {logoutMessage && (
          <div className="success-message">
            {logoutMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('login.emailLabel')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder={t('login.emailPlaceholder')}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('login.passwordLabel')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? t('login.signingIn') : t('login.signInBtn')}
          </button>
        </form>

        <p className="auth-link">
          {t('login.noAccount')}{' '}
          <Link to="/signup">{t('login.signUpLink')}</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;