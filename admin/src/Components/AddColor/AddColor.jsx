import { useState } from "react";
import axios from "axios";
import "./AddColor.css";

const API_URL = "http://localhost:4000/api";

const AddColor = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Color name is required");
      return;
    }

    try {
      setLoading(true);

      const exists = await axios.get(`${API_URL}/colors/check-name`, {
        params: { name },
      });

      if (exists.data.exists) {
        setError("Color already exists");
        return;
      }

      await axios.post(`${API_URL}/colors`, {
        name: name.trim(),
        slug: name.toLowerCase().replace(/\s+/g, "-"),
      });

      setName("");
    } catch {
      setError("Failed to add color");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-color-card">
      <h3>Add Color</h3>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Color name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {error && <p className="add-color-error">{error}</p>}

        <button disabled={loading}>
          {loading ? "Adding..." : "Add Color"}
        </button>
      </form>
    </div>
  )
}

export default AddColor