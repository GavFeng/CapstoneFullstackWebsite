import React from 'react'
import './Admin.css'
import Sidebar from '../../Components/Sidebar/Sidebar'
import Dashboard from '../../Components/Dashboard/Dashboard'  
import JigForm from '../../Components/Jig/JigForm/JigForm'
import ViewJigs from '../../Components/Jig/ViewJigs/ViewJigs'
import Analytic from '../../Components/Analytic/Analytic'
import AddCategory from '../../Components/AddCategory/AddCategory'
import AddWeight from '../../Components/AddWeight/AddWeight'
import AddColor from '../../Components/AddColor/AddColor'
import { Route, Routes, Navigate } from 'react-router-dom'


const Admin = () => {
  return (
    <div className="admin">
      <Sidebar />
      <main className="content-area">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home"    element={<Dashboard />} />
          <Route path="/addjig"  element={<JigForm />} />
          <Route path="/jig"     element={<ViewJigs />} />
          <Route path="/analytic" element={<Analytic />} />
          <Route path="/addcategory" element={<AddCategory />} />
          <Route path="/addweight" element={<AddWeight />} />
          <Route path="/addcolor" element={<AddColor />} />
          <Route path="/editjig/:id"  element={<JigForm />} />
        </Routes>
      </main>
    </div>
  )
}

export default Admin