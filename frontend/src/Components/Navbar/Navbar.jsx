import React, { useState, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../../Assets/TempLogo.png';
import cart_icon from '../../Assets/cart_icon.png';
import { JigContext } from '../../Context/JigContext';
import { useAuth } from '../../Context/AuthContext';


const Navbar = () => {
  const { totalItems = 0 } = useContext(JigContext);
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'All', to: '/alljigs' },
  ];

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = user?.name ? getInitials(user.name) : '';

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <img src={logo} alt="SquidJigs" />
          <p>SquidJigs</p>
        </Link>

        {/* Desktop Menu */}
        <ul className="nav-menu">
          {navLinks.map(({ label, to }) => (
            <li key={to} className="nav-item">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                {label}
              </NavLink>
              <span className="nav-underline" />
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="nav-right">
          {/* Login */}
          {loading ? (
            <span className="nav-loading">...</span>
          ) : user ? (
            <div className="nav-profile-wrapper">
              
              <div 
                className="profile-avatar"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {initials || "?"}
              </div>

              {menuOpen && (
                <div className="profile-dropdown">
                  <Link to="/profile" className="dropdown-item">
                    Profile
                  </Link>

                  <Link
                    to="/login"
                    state={{ message: "Successfully logged out" }}
                    className="dropdown-item"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </Link>
                </div>
              )}

            </div>
          ) : (
            <Link to="/login" className="nav-login">
              Login
            </Link>
          )}
          {/* Cart with count badge */}
          <Link to="/cart" className="nav-cart">
            <img src={cart_icon} alt="Cart" />
            {totalItems > 0 && (
              <span className="cart-count">{totalItems}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar