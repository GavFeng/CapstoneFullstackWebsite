import React from "react";
import './ColorList.css';

const ColorList = ({ colors, colorOrder, formData, setFormData, setPopupImage, setNewJigColor }) => {
  const editColor = (index) => {
    setNewJigColor(formData.colors[index]);
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  if (formData.colors.length === 0) return null;

  return (
    <ul className="color-list">
      {formData.colors
        .slice()
        .sort((a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color))
        .map((c, idx) => (
          <li key={idx} className="color-item">
            <div className="color-main">
              <span>
                {colors.find(co => co._id === c.color)?.name} – Stock: {c.stock}
              </span>
              {c.images.length > 0 && (
                <div className="preview-list">
                  {c.images.map((file, i) => {
                    const previewUrl = URL.createObjectURL(file);
                    return (
                      <div key={i} className="preview-item">
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className="clickable-image"
                          onClick={() => setPopupImage(previewUrl)}
                        />
                        <span className="filename">{file.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="color-actions">
              <button type="button" onClick={() => editColor(idx)}>Edit</button>
              <button type="button" onClick={() => removeColor(idx)}>Delete</button>
            </div>
          </li>
      ))}
    </ul>
  );
};

export default ColorList;
