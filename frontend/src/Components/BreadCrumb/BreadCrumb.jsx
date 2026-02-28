import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

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
          {jig.category.name}
          <span className="separator">›</span>
          {jig.weight.label}
          <span className="separator">›</span>
        </>
      )}
      <span className="current">{jig.name}</span>
    </nav>
  )
}

export default Breadcrumb
