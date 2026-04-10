import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../Assets/TempLogo.png';
import './Navbar.css';

const Navbar = ({ setToken }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const navigate = useNavigate();

  // Load admin data from localStorage on mount
  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("admin_user") || "{}");
    setAdminName(adminData.name || 'Admin');
  }, []);

  /* ---------- HELPERS ---------- */
  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    if (setToken) {
      setToken(null);
    }
    navigate("/login");
  };

  return (
    <div className='navbar'>
      <div className='nav-left'>
        <img src={logo} alt="Logo" className='nav-logo'/>
        <p className='nav-name'>Squid Jigs</p>
      </div>

      <p className='nav-center'>Admin Panel</p>

      <div className="nav-right">
        <div className="nav-profile-wrapper">
          <div 
            className="profile-avatar" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {getInitials(adminName)}
          </div>

          {menuOpen && (
            <div className="profile-dropdown">
              <button className="dropdown-item signout-btn" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;