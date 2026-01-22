import React, { useEffect, useState } from "react";
import axios from "axios";
import './AddJig.css'

const API_URL = `http://localhost:4000/api`;

const AddJig = () => {
  const [categories, setCategories] = useState([]);
  const [weights, setWeights] = useState([]);
  const [colors, setColors] = useState([]);
  const [popupImage, setPopupImage] = useState(null);

  

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
      } catch (err) {
        console.error("Error fetching options:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle new color input
  const handleNewColorChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setNewColor({ ...newColor, images: Array.from(files) });
    } else {
      setNewColor({ ...newColor, [name]: value });
    }
  };

  // Add new color to formData
  const addColor = () => {
    if (!newColor.color) return;

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

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
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
          imagesURLs.push(`${API_URL.replace("/api", "")}${res.data.image_url}`);
        }
        uploadedColors.push({
          color: c.color,
          stock: c.stock,
          image: imagesURLs,
        });
      }

      // Step 2: Submit Jig
      const jigPayload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
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
      <form onSubmit={handleSubmit} className="add-jig-form">
        <label>
          Name:
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Price:
          <input
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </label>

        <div class="form-row">
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
        {formData.colors.length > 0 && (
          <ul className="color-list">
            {formData.colors.map((c, idx) => (
              <li key={idx} className="color-item">
                <div className="color-main">
                  <span>
                    {colors.find(co => co._id === c.color)?.name}
                    {" "}– Stock: {c.stock}
                  </span>

                  {/* Image preview area */}
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

        <div className="color-inputs">
          <select
            name="color"
            value={newColor.color}
            onChange={handleNewColorChange}
          >
            <option value="">--Select Color--</option>
            {colors.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            name="stock"
            type="number"
            min="1"
            value={newColor.stock}
            onChange={handleNewColorChange}
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

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Jig"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}

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
    </div>
  )
}


export default AddJig