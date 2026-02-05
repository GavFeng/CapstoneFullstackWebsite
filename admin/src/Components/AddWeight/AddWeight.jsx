import { useState } from "react";
import axios from "axios";
import "./AddWeight.css";

const API_URL = "http://localhost:4000/api";

const AddWeight = () => {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!label.trim() || !value) {
      setError("Label and value are required");
      return;
    }

    try {
      setLoading(true);

      const exists = await axios.get(`${API_URL}/weights/check-label`, {
        params: { label, value },
      });

      if (exists.data.exists) {
        setError("Weight already exists");
        return;
      }

      await axios.post(`${API_URL}/weights`, {
        label: label.trim(),
        value: Number(value),
      });

      setLabel("");
      setValue("");
    } catch {
      setError("Failed to add weight");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-weight-card">
      <h3>Add Weight</h3>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Label (e.g. 1/4 oz)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        <input
          type="number"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {error && <p className="add-weight-error">{error}</p>}

        <button disabled={loading}>
          {loading ? "Adding..." : "Add Weight"}
        </button>
      </form>
    </div>
  )
}

export default AddWeight
