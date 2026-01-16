import React from 'react'
import './Sidebar.css'
import { NavLink, Link } from 'react-router-dom'
const Sidebar = () => {
  const navLinks = [
    {label: 'Add', to: '/addjig'},
    {label: 'View All', to: '/jig'},
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