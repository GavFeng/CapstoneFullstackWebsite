import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Homepage from './Pages/Homepage'
import JigCategory from './Pages/JigCategory'
import Cart from './Pages/Cart'
import Login from './Pages/Login'

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/alljig" element={<JigCategory />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App