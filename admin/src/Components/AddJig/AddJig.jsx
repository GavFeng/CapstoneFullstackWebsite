import React, { useEffect, useState } from "react";
import axios from "axios";
import './AddJig.css'

const API_URL = `http://localhost:4000/api`;

const AddJig = () => {
  const [categories, setCategories] = useState([]);
  const [weights, setWeights] = useState([]);
  const [colors, setColors] = useState([]);
  const [popupImage, setPopupImage] = useState(null);
  const [nameError, setNameError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [colorOrder, setColorOrder] = useState([]);
  

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    weight: "",
    colors: [], 
  });

  const [newColor, setNewColor] = useState({
    color: "",
    stock: 1,
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  // Fetch categories, weights, colors from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, weightRes, colorRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/weights`),
          axios.get(`${API_URL}/colors`),
        ]);

        setCategories(catRes.data);
        setWeights(weightRes.data);
        setColors(colorRes.data);
        setColorOrder(colorRes.data.map(c => c._id));
      } catch (err) {
        console.error("Error fetching options:", err);
      }
    };
    fetchData();
  }, []);


  const checkDuplicateName = async () => {
    const name = formData.name.trim();
    console.log("duplicate name check");
    if (!name) return false;
     console.log("duplicate name?");
    try {
      const res = await axios.get(`${API_URL}/jigs/check-name`, {
        params: { name }
      });
      if (res.data.exists) {
        setNameError("A jig with this name already exists");
        console.log("duplicate name");
        return true;
      }
      setNameError("");
      console.log("no duplicate name");
      return false;
    } catch (err) {
      console.error("Error checking duplicate name:", err);
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      setNameError(""); 
    }

    if (name === "price") {
      // Allow digits + one decimal
      const cleaned = value
        .replace(/[^0-9.]/g, "")
        .replace(/^0+(?!\.)/, "")
        .replace(/(\..*)\./g, "$1");

      setFormData({ ...formData, price: cleaned });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // Handle new color input
  const handleNewColorChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "stock") {
      const cleaned = value.replace(/\D/g, "").replace(/^0+/, "");
      setNewColor({ ...newColor, stock: cleaned });
      return;
    }

    if (name === "images") {
      setNewColor({ ...newColor, images: Array.from(files) });
      return;
    }

    setNewColor({ ...newColor, [name]: value });
  };

  // Add new color to formData
  const addColor = () => {
    if (!newColor.color) {
      setMessage("Please select a color");
      return;
    };

    if (!newColor.stock || newColor.stock < 1) {
      setMessage("Stock must be at least 1");
      return;
    }

    if (newColor.images.length === 0) {
      setMessage("Please add at least one image");
      return;
    }
    const exists = formData.colors.some(
      c => c.color === newColor.color
    );

    if (exists) {
      setMessage("Color already added");
      return;
    }

    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, newColor],
    }));

    setNewColor({ color: "", stock: 1, images: [] });
  };

  const editColor = (index) => {
    setNewColor(formData.colors[index]);
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

  const fail = (msg) => {
    setMessage(msg);
    setLoading(false);
    return false;
  };

  //Checking if everything is correct
  const validateJigForm = () => {
    if (!formData.name.trim()) return fail("Name is required");
    if (!formData.description.trim()) return fail("Description is required");

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum < 0)
      return fail("Price must be a valid number");

    if (!formData.category) return fail("Please select a category");
    if (!formData.weight) return fail("Please select a weight");

    if (formData.colors.length === 0)
      return fail("Please add at least one color");

    for (const c of formData.colors) {
      const stockNum = Number(c.stock);
      if (isNaN(stockNum) || stockNum < 1)
        return fail("Each color must have stock ≥ 1");

      if (!c.images || c.images.length === 0)
        return fail("Each color must have at least one image");
    }

    return true;
  };
  

  const handleAddJigClick = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate form first
    if (!validateJigForm()) return;

    // Check duplicate name
    const isDuplicate = await checkDuplicateName();
    if (isDuplicate) return;

    // Show preview modal
    setShowConfirm(true);
  };
  
  const handleConfirmAdd = async () => {
    setLoading(true);
    setMessage("");

    try {
      const uploadedColors = [];
      for (const c of formData.colors) {
        const imagesURLs = [];
        for (const file of c.images) {
          const form = new FormData();
          form.append("image", file);
          const res = await axios.post(`${API_URL}/uploadImage`, form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          let imageUrl = res.data.image_url;
          if (!imageUrl.startsWith("http")) {
            imageUrl = `https://${imageUrl.replace(/^\/+/, "")}`;
          }
          imagesURLs.push(imageUrl);
        }
        uploadedColors.push({
          color: c.color,
          stock: Number(c.stock),
          image: imagesURLs,
        });
      }

      const jigPayload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        weight: formData.weight,
        colors: uploadedColors,
      };

      const res = await axios.post(`${API_URL}/jigs`, jigPayload);
      setMessage("Jig created successfully!");
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        weight: "",
        colors: [],
      });
      setShowConfirm(false);

    } catch (err) {
      console.error(err);
      setMessage("Error creating jig.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-jig-container">
      <h2>Add New Jig</h2>
      <form onSubmit={handleAddJigClick} className="add-jig-form">

        {/* Name */}
        <label>
          Name:
          <input
            name="name"
            value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setNameError("");
              }}
            required
            onBlur={checkDuplicateName}
          />
          {nameError && <span className="error-text">{nameError}</span>}
        </label>

        {/* Description */}
        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </label>

        {/* Price */}

        <label>
          Price:
          <input
            name="price"
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </label>

        {/* Category + Weight */}
        <div className="form-row">
          <div>
            <label>
              Category:
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">--Select Category--</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label>
              Weight:
              <select name="weight" value={formData.weight} onChange={handleChange} required>
                <option value="">--Select Weight--</option>
                {weights.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <h3>Colors</h3>

        {/* View Added Colors */}

        {formData.colors.length > 0 && (
          <ul className="color-list">
            {formData.colors
              .slice() // clone so original array isn’t mutated
              .sort(
                (a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color)
              )
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
        )}


        {/* Colors Adder */}

        <div className="color-inputs">
          <select
            name="color"
            value={newColor.color}
            onChange={handleNewColorChange}
          >
            <option value="">--Select Color--</option>
            {colors
              .filter(c => !formData.colors.some(fc => fc.color === c._id))
              .map(c => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
            ))}
          </select>
            <input
              name="stock"
              type="text"
              inputMode="numeric"
              value={newColor.stock}
              onChange={handleNewColorChange}
              required
            />
          <div className="file-input-wrapper">
            <input
              type="file"
              name="images"
              multiple
              onChange={handleNewColorChange}
              id="color-images-input"
            />
            <label htmlFor="color-images-input" className="file-label">
              {newColor.images.length > 0
                ? `${newColor.images.length} file${newColor.images.length > 1 ? 's' : ''} selected`
                : 'Choose Images'}
            </label>
          </div>
          <button type="button" onClick={addColor}>
            Add Color
          </button>
        </div>
          
        {/* Submit Jig */}
        <button
          type="submit"
          onClick={handleAddJigClick}
          disabled={loading || !!nameError}
        >
          {loading ? "Adding..." : "Add Jig"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}



      
      {/* Image Popup */}
      {popupImage && (
        <div className="image-popup" onClick={() => setPopupImage(null)}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <button
              className="popup-close"
              onClick={() => setPopupImage(null)}
            >
              ×
            </button>
            <img src={popupImage} className="popup-img" />
          </div>
        </div>
      )}

       {/* Confirmation Popup */}
      {showConfirm && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <h2>Confirm Jig Details</h2>

            {/* Jig Info */}
            <div className="modal-info">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Description:</strong> {formData.description}</p>
              <p><strong>Price:</strong> ${formData.price}</p>
              <p>
                <strong>Category:</strong> {categories.find(c => c._id === formData.category)?.name}
              </p>
              <p>
                <strong>Weight:</strong> {weights.find(w => w._id === formData.weight)?.label}
              </p>
            </div>

            {/* Colors */}
            <div>
              <p className="font-medium mb-2">Colors</p>
              <div className="colors-grid">
                {formData.colors
                  .slice()
                  .sort((a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color))
                  .map((c, idx) => (
                    <div key={idx} className="color-card">
                      <div className="color-images">
                        {c.images.map((img, i) => {
                          const previewUrl = URL.createObjectURL(img);
                          return (
                            <img
                              key={i}
                              src={previewUrl}
                              alt="Color Preview"
                              className="color-preview-img"
                            />
                          );
                        })}
                      </div>
                      <p className="color-name">{colors.find(co => co._id === c.color)?.name}</p>
                      <p className="color-stock">Stock: {c.stock}</p>
                    </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="modal-buttons">
              <button
                onClick={() => setShowConfirm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdd}
                className="confirm-btn"
              >
                Confirm & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export default AddJig