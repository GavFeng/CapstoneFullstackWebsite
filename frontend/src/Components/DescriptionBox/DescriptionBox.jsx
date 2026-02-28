import React from 'react';
import './DescriptionBox.css';

const DescriptionBox = ({ jig }) => {
  return (
    <div className="description-box">
      <div className="tab-header">Description</div>
      <div className="content">
        {jig?.description ? (
          <p>{jig.description}</p>
        ) : (
          <p>No detailed description available for this product.</p>
        )}

        {jig?.weight && (
          <p><strong>Weight:</strong> {jig.weight.label}</p>
        )}
        {jig?.category && (
          <p><strong>Category:</strong> {jig.category.name}</p>
        )}
      </div>
    </div>
  )
}

export default DescriptionBox