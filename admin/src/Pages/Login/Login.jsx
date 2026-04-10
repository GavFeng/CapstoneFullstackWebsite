import React, { useState } from 'react';
import api from '../../Services/api';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post("/users/login", { email, password });

      if (data.user.accountType !== 'admin') {
        setError("Access Denied: You do not have administrator privileges.");
        setLoading(false);
        return;
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));
      
      if (setToken) {
        setToken(data.token);
      }
    
      navigate("/home", { replace: true }); 

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <form onSubmit={handleLogin} className="admin-login-card">
        <h1>Admin Portal</h1>
        <p>Please sign in to manage orders</p>
        
        <div className="input-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {error && <div className="error-alert">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Login to Dashboard'}
        </button>
      </form>
    </div>
  );
};

export default Login;