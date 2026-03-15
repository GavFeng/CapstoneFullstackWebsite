import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Homepage from './Pages/HomePage/HomePage'
import JigCategory from './Pages/JigCategory/JigCategory'
import Cart from './Pages/Cart/Cart'
import Login from './Pages/LoginSignup/Login'
import JigPage from './Pages/JigPage/JigPage'
import Signup from './Pages/LoginSignup/Signup'
import { AuthProvider } from './Context/AuthContext'

const App = () => {
  return (
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/alljigs" element={<JigCategory />} />

          <Route path="/jig/:id/:slug?" element={<JigPage />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
  )
}

export default App