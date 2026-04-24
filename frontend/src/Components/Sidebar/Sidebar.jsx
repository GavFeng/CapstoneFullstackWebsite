import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import './Sidebar.css'

const Sidebar = () => {
  const { t } = useTranslation();
  const navLinks = [
    {label: t('nav.profile'), to: '/profile/my-profile'},
    {label: t('nav.orders'), to: '/profile/my-orders'},
  ]

  return (
    <div className='sidebar'>
      <ul>
        {navLinks.map(({label, to}) => (
          <li key={to} className='nav-item'>
            <NavLink 
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar