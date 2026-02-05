import React, { useEffect, useState } from "react";
import axios from "axios";
import './AddJig.css';

import {
  ColorList,
  ColorInput,
  ConfirmModal,
  AddOptionModal,
  ImagePopup
} from "../components";

const API_URL = "http://localhost:4000/api";


const AddJig = () => {
  /* ---------- STATE ---------- */
  const [categories, setCategories] = useState([]);
  const [weights, setWeights] = useState([]);
  const [colors, setColors] = useState([]);
  const [colorOrder, setColorOrder] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    weight: "",
    colors: [],
  });

  const [newJigColor, setNewJigColor] = useState({
    color: "",
    stock: 1,
    images: [],
  });

  const [popupImage, setPopupImage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewWeight, setShowNewWeight] = useState(false);
  const [showNewColor, setShowNewColor] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [nameError, setNameError] = useState("");

  const [newCategory, setNewCategory] = useState("");
  const [newWeight, setNewWeight] = useState({ label: "", value: "" });
  const [newColor, setNewColor] = useState("");

  const [categoryError, setCategoryError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [colorError, setColorError] = useState("");

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, weightRes, colorRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/weights`),
          axios.get(`${API_URL}/colors`),
        ]);

        setCategories(catRes.data);
        setWeights(weightRes.data.sort((a, b) => a.value - b.value));
        setColors(colorRes.data);
        setColorOrder(colorRes.data.map(c => c._id));
      } catch (err) {
        console.error("Error fetching options:", err);
      }
    };
    fetchData();
  }, []);

  /* ---------- HELPERS ---------- */
  const fail = (msg) => {
    setMessage(
      <div className="error-message">
        ⚠️ <strong>{msg}</strong>
      </div>
    );
    setLoading(false);
    return false;
  };

  const checkDuplicateName = async () => {
    const name = formData.name.trim();
    if (!name) return false;

    try {
      const res = await axios.get(`${API_URL}/jigs/check-name`, {
        params: { name },
      });

      if (res.data.exists) {
        setNameError("⚠️ A jig with this name already exists");
        return true;
      }

      setNameError("");
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const validateJigForm = () => {
    if (!formData.name.trim()) return fail("Name is required");
    if (!formData.description.trim()) return fail("Description is required");
    if (isNaN(Number(formData.price)) || Number(formData.price) < 0)
      return fail("Price must be valid");
    if (!formData.category) return fail("Please select a category");
    if (!formData.weight) return fail("Please select a weight");
    if (formData.colors.length === 0) return fail("Add at least one color");

    for (const c of formData.colors) {
      if (isNaN(Number(c.stock)) || Number(c.stock) < 1)
        return fail("Each color must have stock ≥ 1");
      if (!c.images || c.images.length === 0)
        return fail("Each color must have at least one image");
    }
    return true;
  };

  const checkCategoryDuplicate = async (name) => {
    const res = await axios.get(`${API_URL}/categories/check-name`, {
      params: { name },
    });
    return res.data.exists;
  };

  const checkWeightDuplicate = async (label, value) => {
    const res = await axios.get(`${API_URL}/weights/check-label`, {
      params: { label, value },
    });
    return res.data.exists;
  };

  const checkColorDuplicate = async (name) => {
    const res = await axios.get(`${API_URL}/colors/check-name`, {
      params: { name },
    });
    return res.data.exists;
  };

  /* ---------- FORM HANDLERS ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price") {
      const cleaned = value
        .replace(/[^0-9.]/g, "")
        .replace(/^0+(?!\.)/, "")
        .replace(/(\..*)\./g, "$1");

      setFormData({ ...formData, price: cleaned });
      return;
    }

    if (name === "name") setNameError("");
    setFormData({ ...formData, [name]: value });
  };

  const handleAddJigClick = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateJigForm()) return;
    if (await checkDuplicateName()) return;

    setShowConfirm(true);
  };

  const handleConfirmAdd = async () => {
    setLoading(true);
    setMessage("");

    try {
      const uploadedColors = [];

      for (const c of formData.colors) {
        const imagesURLs = [];

        for (const imgObj of c.images) {
          const form = new FormData();
          form.append("image", imgObj.file);

          const res = await axios.post(`${API_URL}/uploadImage`, form, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          let imageUrl = res.data?.image_url;

          if (!imageUrl || typeof imageUrl !== "string") {
            throw new Error("Invalid image URL returned from server");
          }

          if (!imageUrl.startsWith("http")) {
            imageUrl = `https://${imageUrl.replace(/^\/+/, "")}`;
          }

          const key = res.data.key;

          imagesURLs.push({ url: imageUrl, key });
        }

        uploadedColors.push({
          color: c.color,
          stock: Number(c.stock),
          images: imagesURLs,
        });
      }


      const jigPayload = {
        ...formData,
        price: Number(formData.price),
        colors: uploadedColors,
      };

      await axios.post(`${API_URL}/jigs`, jigPayload);

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


  /* ==================== JSX ==================== */
  return (
    <div className="add-jig-container">
      <h2>Add New Jig</h2>
      <form className="add-jig-form" onSubmit={handleAddJigClick}>

        {/* Name */}
        <label>
          Name:
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={checkDuplicateName}
            required
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

        {/* Category & Weight */}
        <div className="form-row">
          <div>
            <div className="colors-header">
              <h3>Category</h3>
              <button
                type="button"
                className="icon-add-btn"
                data-tooltip="Add new category"
                onClick={() => setShowNewCategory(true)}
              >
                +
              </button>
            </div>

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="colors-header">
              <h3>Weight</h3>
              <button
                type="button"
                className="icon-add-btn"
                data-tooltip="Add new weight"
                onClick={() => setShowNewWeight(true)}
              >
                +
              </button>
            </div>

            <select
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              required
            >
              <option value="">-- Select Weight --</option>
              {weights.map(w => (
                <option key={w._id} value={w._id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Colors */}
        <div className="colors-header">
          <h3>Colors + Stock</h3>
          <button
            type="button"
            className="icon-add-btn"
            data-tooltip="Add new color"
            onClick={() => setShowNewColor(true)}
          >
            +
          </button>
        </div>
        <ColorList
          colors={colors}
          colorOrder={colorOrder}
          formData={formData}
          setFormData={setFormData}
          setPopupImage={setPopupImage}
          setNewJigColor={setNewJigColor}
        />
        <ColorInput
          colors={colors}
          formData={formData}
          newJigColor={newJigColor}
          setNewJigColor={setNewJigColor}
          addColor={() =>
            setFormData(prev => ({ ...prev, colors: [...prev.colors, newJigColor] }))
          }
        />
        

        {/* Submit */}
        <button type="submit" disabled={loading || !!nameError}>
          {loading ? "Adding..." : "Add Jig"}
        </button>
      </form>

      {message && message}

      {/* Popup & Modals */}
      {popupImage && <ImagePopup src={popupImage} onClose={() => setPopupImage(null)} />}

      {showConfirm && (
        <ConfirmModal
          formData={formData}
          colors={colors}
          colorOrder={colorOrder}
          categories={categories}
          weights={weights}
          handleConfirmAdd={handleConfirmAdd}
          onClose={() => setShowConfirm(false)}
        />
      )}

      {showNewCategory && (
        <AddOptionModal
          title="Add New Category"
          value={newCategory}
          setValue={setNewCategory}
          error={categoryError}
          onClose={() => {
            setCategoryError("");
            setShowNewCategory(false);
          }}
          onSave={async () => {
            setCategoryError("");

            if (!newCategory.trim()) {
              setCategoryError("Category name is required");
              return;
            }

            if (await checkCategoryDuplicate(newCategory)) {
              setCategoryError("Category already exists");
              return;
            }

            const res = await axios.post(`${API_URL}/categories`, {
              name: newCategory.trim(),
            });

            setCategories(prev => [...prev, res.data]);
            setFormData({ ...formData, category: res.data._id });
            setNewCategory("");
            setShowNewCategory(false);
          }}
        />
      )}

      {showNewWeight && (
        <AddOptionModal
          title="Add New Weight"
          value={newWeight}
          setValue={setNewWeight}
          isWeight
          error={weightError}
          onClose={() => {
            setWeightError("");
            setShowNewWeight(false);
          }}
          onSave={async () => {
            setWeightError("");

            if (!newWeight.label.trim() || !newWeight.value) {
              setWeightError("Label and value are required");
              return;
            }

            if (await checkWeightDuplicate(newWeight.label, newWeight.value)) {
              setWeightError("Weight already exists");
              return;
            }

            const res = await axios.post(`${API_URL}/weights`, {
              label: newWeight.label.trim(),
              value: Number(newWeight.value),
            });

            setWeights(prev => [...prev, res.data].sort((a, b) => a.value - b.value));
            setFormData({ ...formData, weight: res.data._id });
            setNewWeight({ label: "", value: "" });
            setShowNewWeight(false);
          }}
        />
      )}

      {showNewColor && (
        <AddOptionModal
          title="Add New Color"
          value={newColor}
          setValue={setNewColor}
          error={colorError}
          onClose={() => {
            setColorError("");
            setShowNewColor(false);
          }}
          onSave={async () => {
            setColorError("");

            if (!newColor.trim()) {
              setColorError("Color name is required");
              return;
            }

            if (await checkColorDuplicate(newColor)) {
              setColorError("Color already exists");
              return;
            }

            const res = await axios.post(`${API_URL}/colors`, {
              name: newColor.trim(),
              slug: newColor.toLowerCase().replace(/\s+/g, "-"),
            });

            setColors(prev => [...prev, res.data]);
            setNewColor("");
            setShowNewColor(false);
          }}
        />
      )}

    </div>
  );
};

export default AddJig
