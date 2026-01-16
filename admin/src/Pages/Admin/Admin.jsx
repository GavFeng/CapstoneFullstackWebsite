import React from 'react'
import './Admin.css'
import Sidebar from '../../Components/Sidebar/Sidebar'  
import AddJig from '../../Components/AddJig/AddJig'
import ViewJigs from '../../Components/ViewJigs/ViewJigs'
import { Route, Routes } from 'react-router-dom'
const Admin = () => {
  return (
    <div className='admin'>
        <Sidebar />
        <Routes>
            <Route path='/addjig' element={<AddJig/>}></Route>
            <Route path='/jig' element={<ViewJigs/>}></Route>
        </Routes>
    </div>
  )
}

export default Admin