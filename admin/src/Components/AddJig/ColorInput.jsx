import React, { useState } from "react";
import './ColorInput.css';


const ColorInput = ({ colors, formData, newJigColor, setNewJigColor, addColor }) => {
  const [message, setMessage] = useState("");

  const isFirstColor = formData.colors.length === 0;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "stock") {
      const cleaned = value.replace(/\D/g, "").replace(/^0+/, "");
      setNewJigColor({ ...newJigColor, stock: cleaned });
      return;
    }

    if (name === "images") {
      setNewJigColor({ ...newJigColor, images: Array.from(files) });
      return;
    }

    setNewJigColor({ ...newJigColor, [name]: value });
  };

  const handleAdd = () => {
    if (!newJigColor.color) return setMessage("⚠️ Please select a color");
    if (!newJigColor.stock || newJigColor.stock < 1) return setMessage("⚠️ Stock must be ≥ 1");
    if (!newJigColor.images.length) return setMessage("⚠️ Please add at least one image");
    if (formData.colors.some(c => c.color === newJigColor.color)) return setMessage("⚠️ Color already added");

    addColor();
    setNewJigColor({ color: "", stock: 1, images: [] });
    setMessage("");
  };

  return (
    <div className="color-inputs">
      <select
        name="color"
        value={newJigColor.color}
        onChange={handleChange}
        className={message.includes("color") ? "input-error" : ""}
         required={isFirstColor}
        >
        <option value="">--Select Color--</option>
        {colors
            .filter(c => !formData.colors.some(fc => fc.color === c._id))
            .map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
            ))}
      </select>

      <input
          name="stock"
          type="text"
          inputMode="numeric"
          value={newJigColor.stock}
          onChange={handleChange}
          className={message.includes("Stock") ? "input-error" : ""}
           required={isFirstColor}
      />

      <div className="file-input-wrapper">
        <input type="file" name="images" multiple onChange={handleChange} id="color-images-input"  required={isFirstColor}/>
        <label htmlFor="color-images-input" className="file-label">
          {newJigColor.images.length > 0
            ? `${newJigColor.images.length} file${newJigColor.images.length > 1 ? "s" : ""} selected`
            : "Choose Images"}
        </label>
      </div>

      <button type="button" onClick={handleAdd}>Add Color</button>
      {message && <span className="error-text">{message}</span>}
    </div>
  );
};

export default ColorInput;
