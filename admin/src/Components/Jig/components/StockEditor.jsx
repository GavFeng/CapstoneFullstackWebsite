import React, { useState } from "react";
import axios from "axios";
import '../ViewJigs/ViewJigs.css';

const StockEditor = ({ jigId, colorId, stock, onUpdate }) => {
  const [currentStock, setCurrentStock] = useState(stock);
  const [loading, setLoading] = useState(false);

  const updateStock = async (action, value = 1) => {
    setLoading(true);
    try {
      const res = await axios.patch(
        `http://localhost:4000/api/jigs/${jigId}/colors/${colorId}/stock`,
        { action, stock: value }
      );

      const updatedColor = res.data.colors.find(c => c.color._id === colorId);
      setCurrentStock(updatedColor?.stock || 0);
      onUpdate(res.data);
    } catch (err) {
      console.error("Failed to update stock:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stock-editor">
      {/* Decrement button */}
      <div className="stock-btn-wrapper" data-tooltip="Remove stock">
        <button
          className="stock-btn"
          onClick={() => updateStock("decrement")}
          disabled={loading || currentStock === 0}
        >
          -
        </button>
      </div>

      {/* Stock number */}
      <div className="stock-number-wrapper" data-tooltip="Stock">
        <input
          type="number"
          className="stock-input"
          value={currentStock}
          min="0"
          onChange={e => setCurrentStock(Number(e.target.value))}
          onBlur={() => updateStock("set", currentStock)}
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

export default StockEditor;
