import React, { useState } from "react";
import axios from "axios";
import '../ViewJigs/ViewJigs.css';

const InventoryEditor = ({ jigId, colorId, stock, sold = 0, onUpdate }) => {
  const [currentStock, setCurrentStock] = useState(stock);
  const [displayValue, setDisplayValue] = useState(stock);
  const [loading, setLoading] = useState(false);


  const lastValidStock = currentStock;
  
  const updateStock = async (action, value = 1) => {
    setLoading(true);
    try {
      const res = await axios.patch(
        `http://localhost:4000/api/jigs/${jigId}/colors/${colorId}/stock`,
        { action, stock: value }
      );

      const updatedColor = res.data.colors.find(c => c.color._id === colorId);
      if (updatedColor) {
        const newStock = updatedColor.stock;
        setCurrentStock(newStock);
        setDisplayValue(newStock);
      }
    } catch (err) {
      console.error("Failed to update stock:", err);
      setDisplayValue(currentStock);
    } finally {
      setLoading(false);
    }
  };

const handleInputChange = (e) => {
  let value = e.target.value;
  if (value === "") {
    setDisplayValue("");
    return;
  }
  value = value.replace(/^0+(?=\d)/, "");
  if (/^\d*$/.test(value)) {
    setDisplayValue(value);
  }
};

  const handleBlur = () => {
    if (!displayValue || displayValue === "") {
      setDisplayValue(lastValidStock);
      return;
    }

    const numValue = Number(displayValue);

    if (isNaN(numValue) || numValue < 0) {
      setDisplayValue(lastValidStock);
      return;
    }

    setCurrentStock(numValue);
    updateStock("set", numValue);
  };

return (
    <div className="stock-editor">
      {/* Decrement button */}
      <div className="stock-btn-wrapper" data-tooltip="Remove stock">
        <button
          className="stock-btn"
          onClick={() => updateStock("decrement")}
          disabled={loading || currentStock <= 0}
        >
          -
        </button>
      </div>

      {/* Stock number */}
      <div className="stock-number-wrapper" data-tooltip="Stock">
        <input
          type="text"
          inputMode="numeric"
          className="stock-input"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={loading}
        />
      </div>

      {/* Increment button */}
      <div className="stock-btn-wrapper" data-tooltip="Add stock">
        <button
          className="stock-btn"
          onClick={() => updateStock("increment")}
          disabled={loading}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default InventoryEditor;
