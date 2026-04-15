import React from 'react';
import ManageAttributes from '../../Components/ManageAttributes/ManageAttributes';
import './AttributeManager.css';

const API_URL = "http://localhost:4000/api";

const AttributeManager = () => {
  return (
    <div className="attribute-manager-page">
      <h2>Manage Store Attributes</h2>
      
      <div className="attribute-grid">
        <ManageAttributes 
          title="Product Categories"
          itemName="Category"
          endpoint={`${API_URL}/categories`}
          checkEndpoint={`${API_URL}/categories/check-name`}
          fields={[{ name: "name", placeholder: "Category Name" }]}
        />

        <ManageAttributes 
          title="Product Colors"
          itemName="Color"
          endpoint={`${API_URL}/colors`}
          checkEndpoint={`${API_URL}/colors/check-name`}
          fields={[{ name: "name", placeholder: "Color Name" }]}
        />

        <ManageAttributes 
          title="Product Weights"
          itemName="Weight"
          endpoint={`${API_URL}/weights`}
          checkEndpoint={`${API_URL}/weights/check-label`}
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