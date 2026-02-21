import React, { useState } from "react";
import axios from "axios";
import "./SoldEditorModal.css";

const SoldEditorModal = ({ jigId, jigName, colors, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Create local state from colors
  const [localState, setLocalState] = useState(() => {
    const initial = {};
    colors.forEach(c => {
      const id = c.color?._id || c.color;
      initial[id] = c.sold || 0;
    });
    return initial;
  });

  const handleChange = (colorId, value) => {
    if (value === "") {
      setLocalState(prev => ({ ...prev, [colorId]: "" }));
      return;
    }

    value = value.replace(/^0+(?=\d)/, "");

    if (/^\d*$/.test(value)) {
      setLocalState(prev => ({
        ...prev,
        [colorId]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const cleanedUpdates = {};

      for (const colorId in localState) {
        const value = Number(localState[colorId]) || 0;

        if (value < 0) return;

        cleanedUpdates[colorId] = value;
      }

      const res = await axios.patch(
        `http://localhost:4000/api/jigs/${jigId}/colors/sold`,
        { soldUpdates: cleanedUpdates }
      );

      onSuccess(res.data);
      onClose();

    } catch (err) {
      console.error("Bulk sold update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sold-modal-overlay">
      <div className="sold-modal">
        <h3>Modify Sold Per Color</h3>
        {jigName && <p className="jig-name">Jig: <strong>{jigName}</strong></p>}
        {colors.map(c => {
          const id = c.color?._id || c.color;

          return (
            <div key={id} className="sold-row">
              <span>{c.color?.name}</span>

              <input
                type="text"
                inputMode="numeric"
                value={localState[id]}
                onChange={(e) => handleChange(id, e.target.value)}
              />
            </div>
          );
        })}

        <div className="sold-modal-buttons">
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoldEditorModal;