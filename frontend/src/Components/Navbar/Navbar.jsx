import React, { useState, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../../Assets/TempLogo.png';
import cart_icon from '../../Assets/cart_icon.png';
import { JigContext } from '../../Context/JigContext';
import { useAuth } from '../../Context/AuthContext';

const Navbar = () => {

  /* ---------- STATE ---------- */

  // Cart item count from global context
  const { totalItems = 0 } = useContext(JigContext);

  // Auth state (user info, loading state, logout function)
  const { user, loading, logout } = useAuth();

  // Controls visibility of profile dropdown menu
  const [menuOpen, setMenuOpen] = useState(false);


  /* ---------- LINKS ---------- */

  // Navigation links
  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'All', to: '/alljigs' },
  ];


  /* ---------- HELPERS ---------- */

  // Generate user initials for avatar
  const getInitials = (name) => {
    if (!name) return '';

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return (
      parts[0][0] + parts[parts.length - 1][0]
    ).toUpperCase();
  };

  // Memoized initials for display
  const initials = user?.name ? getInitials(user.name) : '';


  /* ---------- HANDLERS ---------- */

  // Toggle profile dropdown menu
  const handleToggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  // Handle logout and close dropdown
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };


  /* ---------- JSX ---------- */

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo / Brand */}
        <Link to="/" className="nav-logo">
          <img src={logo} alt="SquidJigs" />
          <p>SquidJigs</p>
        </Link>

        {/* Desktop Navigation Menu */}
        <ul className="nav-menu">
          {navLinks.map(({ label, to }) => (
            <li key={to} className="nav-item">
              <NavLink
                to={to}
                // Highlight active route
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                {label}
              </NavLink>

              {/* Underline for hover/active styling */}
              <span className="nav-underline" />
            </li>
          ))}
        </ul>

        {/* Right Side (Auth + Cart) */}
        <div className="nav-right">

          {/* Auth Section */}
          {loading ? (
            // Show loading state while auth is initializing
            <span className="nav-loading">...</span>

          ) : user ? (
            // Logged-in state: show profile avatar + dropdown
            <div className="nav-profile-wrapper">

              <div
                className="profile-avatar"
                onClick={handleToggleMenu}
              >
                {initials || "?"}
              </div>

              {/* Dropdown menu */}
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
            // Logged-out state: show login button
            <Link to="/login" className="nav-login">
              Login
            </Link>
          )}

          {/* Cart Icon + Item Count */}
          <Link to="/cart" className="nav-cart">
            <img src={cart_icon} alt="Cart" />

            {/* Only show if items are in Cart */}
            {totalItems > 0 && (
              <span className="cart-count">
                {totalItems}
              </span>
            )}
          </Link>

        </div>
      </div>
    </nav>
  );
}

export default Navbar