import React, { useContext, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';

import logo from '../../Assets/TempLogo.png';
import cart_icon from '../../Assets/cart_icon.png';

import { JigContext } from '../../Context/JigContext';
import { useAuth } from '../../Context/AuthContext';

const Navbar = () => {
  const { user, loading, logout } = useAuth();

  const { totalItems = 0 } = useContext(JigContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'All', to: '/alljigs' },
  ];

  const handleToggleMenu = () => setMenuOpen(prev => !prev);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileMenuOpen(false);
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

          {loading ? (
            <span className="nav-loading">...</span>
          ) : user ? (
            <div className="nav-profile-wrapper">
              <div className="profile-avatar" onClick={handleToggleMenu}>
                {user.name ? user.name[0].toUpperCase() : "?"}
              </div>

              {menuOpen && (
                <div className="profile-dropdown">
                  <Link to="/profile" className="dropdown-item">
                    Profile
                  </Link>

                  <Link to="/profile/my-orders" className="dropdown-item">
                    Orders
                  </Link>

                  <Link
                    to="/login"
                    className="dropdown-item"
                    onClick={handleLogout}
                  >
                    Logout
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-login">
              Login
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="nav-cart">
            <img src={cart_icon} alt="Cart" />
            {totalItems > 0 && (
              <span className="cart-count">{totalItems}</span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <ul>
            {navLinks.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? 'mobile-link active'
                      : 'mobile-link'
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}

            {!user ? (
              <li>
                <Link
                  to="/login"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    to="/profile"
                    className="mobile-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </li>

                <li>
                  <Link
                    to="/profile/my-orders"
                    className="mobile-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                </li>

                <li>
                  <Link
                    to="/login"
                    className="mobile-link"
                    onClick={handleLogout}
                  >
                    Logout
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar