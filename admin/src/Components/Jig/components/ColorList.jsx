import React from "react";
import './ColorList.css';

const ColorList = ({ colors, colorOrder, formData, setFormData, setPopupImage, setNewJigColor, isEditing}) => {
  const editColor = (colorId) => {
    const target = formData.colors.find(c => c.color === colorId);
    if (!target) return;

    setNewJigColor(target);

    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c.color !== colorId),
    }));
  };

  const removeColor = (colorId) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c.color !== colorId),
    }));
  };

  if (!formData.colors.length) return null;

  const sortedColors = [...formData.colors].sort(
    (a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color)
  );

    return (
    <ul className="color-list">
      {sortedColors.map(c => (
        <li key={c.color} className="color-item">
          <div className="color-main">
            <span>
              {colors.find(co => co._id === c.color)?.name} – Stock: {c.stock}
            </span>

            {c.images.length > 0 && (
              <div className="preview-list">
                {c.images.map((imgObj, i) => (
                  <div key={i} className="preview-item">
                    <img
                      src={imgObj.url || imgObj.preview}
                      alt={imgObj.file?.name || `color-${c.color}-${i}`}
                      className="clickable-image"
                      onClick={() =>
                        setPopupImage(imgObj.preview || imgObj.url)
                      }
                    />
                    <span className="filename">
                      {imgObj.file?.name || `image-${i}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="color-actions">
            <button
              type="button"
              disabled={isEditing}
              onClick={() => editColor(c.color)}
            >
              Edit
            </button>
            <button
              type="button"
              disabled={isEditing}
              onClick={() => removeColor(c.color)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ColorList;
