import React from 'react';
import ManageAttributes from '../../Components/ManageAttributes/ManageAttributes';
import './AttributeManager.css';


const AttributeManager = () => {
  return (
    <div className="attribute-manager-page">
      <h2>Manage Store Attributes</h2>
      
      <div className="attribute-grid">
        <ManageAttributes 
          title="Product Categories"
          itemName="Category"
          endpoint={`categories`}
          checkEndpoint={`categories/check-name`}
          fields={[{ name: "name", placeholder: "Category Name" }]}
        />

        <ManageAttributes 
          title="Product Colors"
          itemName="Color"
          endpoint={`colors`}
          checkEndpoint={`colors/check-name`}
          fields={[{ name: "name", placeholder: "Color Name" }]}
        />

        <ManageAttributes 
          title="Product Weights"
          itemName="Weight"
          endpoint={`weights`}
          checkEndpoint={`weights/check-label`}
          fields={[
            { name: "label", placeholder: "Label (e.g. 1/4 oz)" },
            { name: "value", placeholder: "Numeric Value", type: "number" }
          ]}
        />
      </div>
    </div>
  );
};

export default AttributeManager;