import { useState, useEffect } from "react";
import api from "../../Services/api";
import "./ManageAttributes.css";

/* ---------- UTILS ---------- */
const fractionToDecimal = (str) => {
  const match = str.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return null;
  const num = Number(match[1]);
  const den = Number(match[2]);
  if (!den || isNaN(num) || isNaN(den)) return null;
  return (num / den).toFixed(3);
};

const ManageAttributes = ({ title, endpoint, checkEndpoint, fields, itemName, onSelect, selectedId, onDelete }) => {
  /* ---------- STATE ---------- */
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState({ 
    show: false, 
    type: null, 
    id: null, 
    displayName: "" 
  });

  const isWeight = itemName.toLowerCase() === "weight";
  const visibleFields = fields.filter(f => f.name !== "value");

  /* ---------- EFFECTS ---------- */
  useEffect(() => { fetchItems(); }, [endpoint]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  /* ---------- LOGIC ---------- */
  const fetchItems = async () => {
    try {
      const res = await api.get(endpoint);
      let data = res.data;
      if (isWeight) data.sort((a, b) => (a.value || 0) - (b.value || 0));
      setItems(data);
    } catch (err) { console.error("Fetch failed", err); }
  };

  const handleBlur = (fieldName, isEdit = false) => {
    const currentData = isEdit ? editData : formData;
    if (isWeight && fieldName === "label") {
      const label = currentData.label || "";
      if (!label) return;
      const hasOz = /\boz\b/i.test(label);
      const normalizedLabel = hasOz ? label.trim() : `${label.trim()} oz`;
      const decimal = fractionToDecimal(normalizedLabel);
      const updatedState = { 
        ...currentData, 
        label: normalizedLabel, 
        value: decimal || currentData.value || "" 
      };
      isEdit ? setEditData(updatedState) : setFormData(updatedState);
    }
  };

  const promptDelete = (item) => {
    setConfirmModal({
      show: true,
      type: "DELETE",
      id: item._id,
      displayName: item.label || item.name || "this item"
    });
  };

  const promptUpdate = (item) => {
    setConfirmModal({
      show: true,
      type: "UPDATE",
      id: item._id,
      displayName: editData.label || editData.name || "this item"
    });
  };

  const executeConfirm = async () => {
    const { type, id } = confirmModal;
    setConfirmModal({ ...confirmModal, show: false });
    try {
      if (type === "DELETE") {
        await api.delete(`${endpoint}/${id}`);
        if (onDelete) onDelete(id);
      } else if (type === "UPDATE") {
        const payload = { ...editData };
        if (payload.value) payload.value = Number(payload.value);
        await api.put(`${endpoint}/${id}`, payload);
        setEditingId(null);
      }
      fetchItems();
    } catch (err) { setError("Action failed"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (payload.value) payload.value = Number(payload.value);
      
      // Slugs are only for non-weight, non-location attributes (e.g., Strains, Categories)
      if (!isWeight && itemName.toLowerCase() !== "location" && payload.name) {
        payload.slug = payload.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      await api.post(endpoint, payload);
      setFormData({});
      fetchItems();
    } catch (err) { setError("Submit failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="manage-card">
      <div className="card-header">
        <h3>{title}</h3>
        <span className="count-badge">{items.length}</span>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className="attribute-form">
        <div className="input-group-manage">
          {visibleFields.map((field) => (
            <div key={field.name} className="input-wrapper">
              <input
                name={field.name}
                className="no-spinner"
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                onBlur={() => handleBlur(field.name, false)}
                required
              />
              {isWeight && field.name === "label" && formData.value && (
                <span className="live-preview-badge">{formData.value} oz</span>
              )}
            </div>
          ))}
          <button className="btn-add" disabled={loading}>{loading ? "..." : "Add"}</button>
        </div>
      </form>

      <div className="item-list">
        {items.map((item) => (
          <div 
            key={item._id} 
            className={`item-row ${editingId === item._id ? 'is-editing' : ''} ${selectedId === item._id ? 'selected' : ''}`}
            onClick={() => onSelect && onSelect(item)} 
          >
            {editingId === item._id ? (
              <div className="edit-mode">
                {visibleFields.map((field) => (
                  <div key={field.name} className="input-wrapper">
                    <input
                      value={editData[field.name] || ""}
                      onChange={(e) => setEditData({ ...editData, [field.name]: e.target.value })}
                      onBlur={() => handleBlur(field.name, true)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {isWeight && field.name === "label" && editData.value && (
                      <span className="live-preview-badge">{editData.value} oz</span>
                    )}
                  </div>
                ))}
                <div className="edit-actions">
                  <button onClick={(e) => { e.stopPropagation(); promptUpdate(item); }} className="btn-save">Save</button>
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(null)}} className="btn-cancel">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="item-info">
                  <div className="item-main">
                    <strong>{item.label || item.name}</strong>
                    {isWeight && item.value !== undefined && (
                      <span className="item-val-pill">{item.value} oz</span>
                    )}
                  </div>
                  {/* Slug is hidden for Weights and Locations */}
                  {itemName.toLowerCase() !== "location" && item.slug && (
                    <div className="item-meta">
                      <code className="item-slug">/{item.slug}</code>
                    </div>
                  )}
                </div>
                <div className="item-actions">
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(item._id); setEditData(item); }} className="btn-edit">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); promptDelete(item); }} className="btn-delete">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {confirmModal.show && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
               <span className="warning-icon">{confirmModal.type === "DELETE" ? "🗑️" : "📝"}</span>
               <h3>Confirm {confirmModal.type === "DELETE" ? "Deletion" : "Update"}</h3>
            </div>
            
            <div className="modal-body">
              <p>
                {confirmModal.type === "DELETE" 
                  ? <>Are you sure you want to delete <strong>{confirmModal.displayName || "this item"}</strong>? This cannot be undone.</>
                  : <>Save changes to <strong>{confirmModal.displayName || "this item"}</strong>?</>
                }
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-secondary" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>Cancel</button>
              <button 
                className={confirmModal.type === "DELETE" ? "btn-modal-danger" : "btn-modal-primary"} 
                onClick={executeConfirm}
              >
                {confirmModal.type === "DELETE" ? "Confirm Delete" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAttributes;