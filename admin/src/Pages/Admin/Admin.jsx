import React from 'react'
import './Admin.css'
import Sidebar from '../../Components/Sidebar/Sidebar'
import Dashboard from '../../Components/Dashboard/Dashboard'  
import AddJig from '../../Components/AddJig/AddJig'
import ViewJigs from '../../Components/ViewJigs/ViewJigs'
import Analytic from '../../Components/Analytic/Analytic'
import { Route, Routes } from 'react-router-dom'
const Admin = () => {
  return (
    <div className='admin'>
        <Sidebar />
        <Routes>
          <Route path='/home' element={<Dashboard/>}></Route>
          <Route path='/addjig' element={<AddJig/>}></Route>
          <Route path='/jig' element={<ViewJigs/>}></Route>
          <Route path='/analytic' element={<Analytic/>}></Route>
        </Routes>
    </div>
  )
}

export default Admin