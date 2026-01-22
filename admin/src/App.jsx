import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Admin from './Pages/Admin/Admin'

const App = () => {
  return (
    <div className="app-wrapper">
      <Navbar />
      <div className="main-layout">
        <Admin />
      </div>
    </div>
  )
}

export default App