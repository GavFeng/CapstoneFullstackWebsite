import React from "react";
import './AddOptionModal.css';

const fractionToDecimal = (str) => {
  const match = str.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return null;

  const num = Number(match[1]);
  const den = Number(match[2]);
  if (!den) return null;

  return (num / den).toFixed(2);
};


const AddOptionModal = ({ title, value, setValue, onClose, onSave, error, isWeight }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h3>{title}</h3>

        {isWeight ? (
          <>
            <input
              placeholder="Label (ex: 3/4 oz)"
              value={value.label}
              onChange={(e) =>
                  setValue({ ...value, label: e.target.value })
              }
              onBlur={() => {
                if (!value.label) return;

                const hasOz = /\boz\b/i.test(value.label);
                const normalizedLabel = hasOz
                  ? value.label
                  : `${value.label.trim()} oz`;

                const decimal = fractionToDecimal(normalizedLabel);

                setValue(prev => ({
                  ...prev,
                  label: normalizedLabel,
                  value: prev.value || decimal || prev.value
                }));
              }}
            />
            <input type="number" step="0.01" placeholder="Value (ex: 0.75)" value={value.value} onChange={(e) => setValue({ ...value, value: e.target.value })} />
          </>
        ) : (
          <input
            placeholder={
                title === "Add New Category"
                ? "Category Name (ex: Dragon, Cyber)"
                : title === "Add New Color"
                ? "Color Name (ex: Blue, Pink, Green)"
                : title
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            />
        )}
        {error && <p className="error-text">{error}</p>}
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="confirm-btn" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default AddOptionModal
