import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Login from './Pages/Login/Login'
import Admin from './Pages/Admin/Admin'
import AdminGuard from './Components/AdminGuard/AdminGuard'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("admin_token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("admin_token"));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="app-wrapper">
      {token && <Navbar setToken={setToken} />}
        <Routes>
          {/* Public Route for Admin Login */}
          <Route path="/login" element={<Login setToken={setToken} />} />
          {/* Protected Admin Routes */}
          <Route 
            path="/*" 
            element={
              <AdminGuard>
                <div className="main-layout">
                  <Admin />
                </div>
              </AdminGuard>
            } 
          />
        </Routes>
    </div>
  )
}

export default App