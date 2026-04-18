import React, { useEffect, useState } from 'react';
import api from '../../Services/api';
import './ManageAccounts.css';

const ManageAccounts = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('users/all');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await api.post('users/create-admin', formData);
      setMessage({ text: 'Admin created successfully!', type: 'success' });
      setFormData({ name: '', username: '', email: '', phone: '', password: '' }); 
      fetchAccounts(); 
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Error creating admin', 
        type: 'error' 
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* CREATE ADMIN SECTION */}
      <div className="admin-card create-admin-section">
        <h2>Create New Admin</h2>
        {message.text && (
          <div className={`status-msg ${message.type}`}>{message.text}</div>
        )}
        <form onSubmit={handleCreateAdmin} className="admin-form">
          <div className="form-group">
            <input 
              name="name" 
              placeholder="Full Name" 
              value={formData.name} 
              onChange={handleInputChange} 
              required 
            />
            <input 
              name="username" 
              placeholder="Username" 
              value={formData.username} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              name="email" 
              type="email" 
              placeholder="Email Address" 
              value={formData.email} 
              onChange={handleInputChange} 
              required 
            />
            <input 
              name="phone" 
              type="text" 
              placeholder="Phone Number" 
              value={formData.phone} 
              onChange={handleInputChange} 
            />
          </div>
          <div className="form-group">
             <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleInputChange} 
              required 
              style={{ flex: "0.5" }}
            />
          </div>
          <button type="submit" disabled={formLoading} className="btn-create">
            {formLoading ? 'Creating...' : 'Register Admin Account'}
          </button>
        </form>
      </div>

      {/* ACCOUNTS TABLE SECTION */}
      <div className="admin-card">
        <h2>System Accounts</h2>
        {loading ? (
          <p>Loading accounts...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.name} (<i>{u.username}</i>)</td>
                  <td>{u.email}</td>
                  <td>{u.phone || <span className="no-data">N/A</span>}</td>
                  <td>
                    <span className={`badge ${u.accountType}`}>
                      {u.accountType}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageAccounts;