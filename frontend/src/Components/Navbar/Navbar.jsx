import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../../Assets/TempLogo.png';
import cart_icon from '../../Assets/cart_icon.png';
import { JigContext } from '../../Context/JigContext';

const Navbar = () => {
  const { totalItems = 0 } = useContext(JigContext);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'All', to: '/alljigs' },
  ];

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
          <Link to="/login" className="nav-login">
            Login
          </Link>

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