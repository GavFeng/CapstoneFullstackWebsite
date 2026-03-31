import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

{/* BreadCrumb Compontent for Jig Page */}
const Breadcrumb = ({ jig }) => {
  if (!jig) return null;

  return (
    <nav className="breadcrumb">

      <Link to="/">Home</Link>
      <span className="separator">›</span>

      <Link to="/alljigs">Shop</Link>
      <span className="separator">›</span>

      {jig.category && (
        <>
          {/*Link to Shop with Filter for Category*/}
          <Link to={`/alljigs?category=${jig.category.slug || jig.category._id}`}>
            {jig.category.name}
          </Link>

          <span className="separator">›</span>

          {/*Link to Shop with Filter for Weight*/}
          <Link
            to={`/alljigs?weight=${jig.weight.slug || jig.weight.id}`}
          >
            {jig.weight.label}
          </Link>

          <span className="separator">›</span>
        </>
      )}

      <span className="current">{jig.name}</span>
    </nav>
  )
}


export default Breadcrumb
