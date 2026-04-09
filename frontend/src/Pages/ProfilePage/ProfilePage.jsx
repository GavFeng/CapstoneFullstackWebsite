import React from 'react'
import Profile from '../../Components/Profile/Profile';
import MyOrders from '../../Components/MyOrders/MyOrders';
import Sidebar from '../../Components/Sidebar/Sidebar';
import { Route, Routes, Navigate } from 'react-router-dom'
import './ProfilePage.css';

const ProfilePage = () => {
  return (
  <div className="main-layout">
    <div className="profile-page">
      <Sidebar/>
      <main className="content-area">
        <Routes>
          <Route path="my-profile" element={<Profile />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="/" element={<Navigate to="my-profile" replace />} />
        </Routes>
      </main>
    </div>
  </div>
  )
}

export default ProfilePage