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
import {JigContextProvider} from './Context/JigContext.jsx'

const App = () => {
  return (
      <BrowserRouter>
        <AuthProvider>
          <JigContextProvider>
            <Navbar />
            <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/alljigs" element={<JigCategory />} />

            <Route path="/jig/:id/:slug?" element={<JigPage />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            </Routes>
          </JigContextProvider>
        </AuthProvider>
      </BrowserRouter>
  )
}

export default App