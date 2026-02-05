import { useState } from "react";
import axios from "axios";
import "./AddCategory.css";

const API_URL = "http://localhost:4000/api";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);

      const exists = await axios.get(`${API_URL}/categories/check-name`, {
        params: { name },
      });

      if (exists.data.exists) {
        setError("Category already exists");
        return;
      }

      await axios.post(`${API_URL}/categories`, {
        name: name.trim(),
      });

      setName("");
    } catch {
      setError("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-category-card">
      <h3>Add Category</h3>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {error && <p className="add-category-error">{error}</p>}

        <button disabled={loading}>
          {loading ? "Adding..." : "Add Category"}
        </button>
      </form>
    </div>
  )
}

export default AddCategory
