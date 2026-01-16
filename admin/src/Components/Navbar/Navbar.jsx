import React from 'react'
import logo from '../../Assets/TempLogo.png'
import temp_user from '../../Assets/Sample_User_Icon.png'
import './Navbar.css'
const Navbar = () => {
  return (
    <div className='navbar'>
      <div className='nav-left'>
        <img src={logo} alt="" className='nav-logo'/>
        <p className='nav-name'>Squid Jigs</p>
      </div>
      <p className='nav-center'>Admin Panel</p>
      <img src={temp_user} alt="user" className='nav-profile'/>
    </div>
  )
}

export default Navbar