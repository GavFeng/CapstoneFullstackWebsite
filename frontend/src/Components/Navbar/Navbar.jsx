import React, { useState, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Navbar.css';
import logo from '../../Assets/TempLogo.png';
import cart_icon from '../../Assets/cart_icon.png';
import { JigContext } from '../../Context/JigContext';
import { useAuth } from '../../Context/AuthContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { totalItems = 0 } = useContext(JigContext);
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  /* ---------- LINKS ---------- */
  const navLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.all'), to: '/alljigs' },
  ];

  /* ---------- HANDLERS ---------- */
  const handleToggleMenu = () => setMenuOpen(prev => !prev);
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        <Link to="/" className="nav-logo">
          <img src={logo} alt="SquidJigs" />
          <p>SquidJigs</p>
        </Link>

        <ul className="nav-menu">
          {navLinks.map(({ label, to }) => (
            <li key={to} className="nav-item">
              <NavLink to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {label}
              </NavLink>
              <span className="nav-underline" />
            </li>
          ))}
        </ul>

        <div className="nav-right">
          
          <div className="lang-switcher">
            <select onChange={changeLanguage} value={i18n.language}>
              <option value="en">EN</option>
              <option value="ko">KO</option>
              <option value="zh">ZH</option>
            </select>
          </div>

          {loading ? (
            <span className="nav-loading">...</span>
          ) : user ? (
            <div className="nav-profile-wrapper">
              <div className="profile-avatar" onClick={handleToggleMenu}>
                {user.name ? user.name[0].toUpperCase() : "?"}
              </div>

              {menuOpen && (
                <div className="profile-dropdown">
                  <Link to="/profile" className="dropdown-item">{t('nav.profile')}</Link>
                  <Link to="/profile/my-orders" className="dropdown-item">{t('nav.orders')}</Link>
                  <Link to="/login" className="dropdown-item" onClick={handleLogout}>
                    {t('nav.logout')}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-login">{t('nav.login')}</Link>
          )}

          <Link to="/cart" className="nav-cart">
            <img src={cart_icon} alt="Cart" />
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </Link>

        </div>
      </div>
    </nav>
  );
}

export default Navbar