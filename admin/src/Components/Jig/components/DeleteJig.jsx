import React, { useState } from 'react'
import axios from "axios";
import "./DeleteJig.css";

const API_URL = "http://localhost:4000/api";

const DeleteJig = ({ jigId, jigName, onDeleteSuccess }) => {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== "delete") {
      setError("Type 'delete' to confirm.");
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/jigs/${jigId}`);

      onDeleteSuccess(jigId);
      setOpen(false);
      setConfirmText("");
      setError("");
    } catch (err) {
      setError("Failed to delete jig.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="delete-btn" onClick={() => setOpen(true)}>
        Delete
      </button>

      {open && (
        <div className="delete-modal-overlay">
            <div className="delete-modal">
            <h3>Delete "{jigName}"?</h3>

            <p>
                Type <strong>delete</strong> to permanently remove{" "}
                <strong>{jigName}</strong>
            </p>

            <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type delete"
            />

            {error && <p className="error">{error}</p>}

            <div className="modal-actions">
                <button
                onClick={() => {
                    setOpen(false);
                    setConfirmText("");
                    setError("");
                }}
                >
                Cancel
                </button>

                <button
                className="confirm-delete"
                onClick={handleDelete}
                disabled={loading || confirmText.toLowerCase() !== "delete"}
                >
                {loading ? "Deleting..." : "Confirm Delete"}
                </button>
            </div>
            </div>
          </div>
        )}
    </>
  )
}

export default DeleteJig