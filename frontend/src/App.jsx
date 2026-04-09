import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Homepage from './Pages/HomePage/HomePage'
import JigCategory from './Pages/JigCategory/JigCategory'
import Cart from './Pages/Cart/Cart'
import Login from './Pages/LoginSignup/Login'
import JigPage from './Pages/JigPage/JigPage'
import Signup from './Pages/LoginSignup/Signup'
import ProfilePage from './Pages/ProfilePage/ProfilePage'
import Checkout from './Pages/Checkout/Checkout'
import { AuthProvider } from './Context/AuthContext'
import {JigContextProvider} from './Context/JigContextProvider.jsx'


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
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
              <Route path="/profile/*" element={<ProfilePage />} />              
            </Routes>
          </JigContextProvider>
        </AuthProvider>
      </BrowserRouter>
  )
}

export default App