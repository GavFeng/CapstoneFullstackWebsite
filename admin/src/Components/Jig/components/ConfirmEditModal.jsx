import React from "react";
import "./ConfirmModal.css";

const renderJig = ({
  title,
  data,
  colors,
  colorOrder,
  categories,
  weights
}) => (
  <div className="modal-edit-column">
    <h3>{title}</h3>

    <div className="modal-edit-meta">
      <p><strong>Name:</strong> {data.name}</p>
      <p><strong>Description:</strong> {data.description}</p>
      <p><strong>Price:</strong> ${data.price}</p>
      <p>
        <strong>Category:</strong>{" "}
        {categories.find(c => c._id === data.category)?.name}
      </p>
      <p>
        <strong>Weight:</strong>{" "}
        {weights.find(w => w._id === data.weight)?.label}
      </p>
    </div>

    <p>Colors</p>
    <div className="modal-colors-grid">
      {(data.colors || [])
        .slice()
        .sort(
          (a, b) =>
            colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color)
        )
        .map((c, idx) => (
          <div key={idx} className="modal-edit-color-card">
            <div className="modal-color-images">
              {(c.images || []).map((imgObj, i) => (
                <img
                  key={i}
                  src={imgObj.url || imgObj.preview}
                  alt="Color Preview"
                  className="modal-color-preview-img"
                />
              ))}
            </div>
            <p>
              {typeof c.color === "object"
                ? c.color.name
                : colors.find(co => co._id === c.color)?.name}
            </p>
            <p>Stock: {c.stock}</p>
          </div>
        ))}
    </div>
  </div>
);

const ConfirmEditModal = ({
  oldJig,
  formData,
  colors,
  colorOrder,
  categories,
  weights,
  handleConfirmEdit,
  onClose
}) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-wide">
        <h2>Confirm Jig Changes</h2>

        <div className="modal-edit-grid">
          {renderJig({
            title: "Current Jig",
            data: oldJig,
            colors,
            colorOrder,
            categories,
            weights
          })}

          {renderJig({
            title: "Updated Jig",
            data: formData,
            colors,
            colorOrder,
            categories,
            weights
          })}
        </div>

        <div className="modal-buttons">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="confirm-btn"
            onClick={handleConfirmEdit}
          >
            Confirm & Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEditModal;