import React from 'react';
import './DescriptionBox.css';

{/* Description Compontent for Jig Page */}
const DescriptionBox = ({ jig }) => {
  return (
    <div className="description-box">
      <div className="tab-header">Description</div>
      <div className="content">
        {/* Description */}
        {jig?.description ? (
          <p>{jig.description}</p>
        ) : (
          <p>No detailed description available for this product.</p>
        )}

        {/* Weight Information */}
        {jig?.weight && (
          <p><strong>Weight:</strong> {jig.weight.label}</p>
        )}
         {/* Category Information */}
        {jig?.category && (
          <p><strong>Category:</strong> {jig.category.name}</p>
        )}
      </div>
    </div>
  )
}

export default DescriptionBox