import React from "react";
import './ConfirmModal.css';

const ConfirmModal = ({ formData, colors, colorOrder, categories, weights, handleConfirmAdd, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <h2>Confirm Jig Details</h2>

        <div className="modal-info">
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Description:</strong> {formData.description}</p>
          <p><strong>Price:</strong> ${formData.price}</p>
          <p><strong>Category:</strong> {categories.find(c => c._id === formData.category)?.name}</p>
          <p><strong>Weight:</strong> {weights.find(w => w._id === formData.weight)?.label}</p>
        </div>

        <div>
          <p>Colors</p>
          <div className="modal-colors-grid">
            {formData.colors.slice().sort((a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color)).map((c, idx) => (
              <div key={idx} className="modal-color-card">
                <div className="modal-color-images">
                  {c.images.map((img, i) => {
                    const previewUrl = URL.createObjectURL(img);
                    return <img key={i} src={previewUrl} alt="Color Preview" className="modal-color-preview-img" />;
                  })}
                </div>
                <p>{colors.find(co => co._id === c.color)?.name}</p>
                <p>Stock: {c.stock}</p>
              </div>
            ))}
          </div>
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
            onClick={handleConfirmAdd}
          >
            Confirm & Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
