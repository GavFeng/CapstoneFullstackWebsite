import { useState, useEffect } from "react";
import axios from "axios";
import "./ManageAttributes.css";

const fractionToDecimal = (str) => {
  const match = str.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return null;
  const num = Number(match[1]);
  const den = Number(match[2]);
  if (!den || isNaN(num) || isNaN(den)) return null;
  return (num / den).toFixed(2);
};

const ManageAttributes = ({ title, endpoint, checkEndpoint, fields, itemName }) => {
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
  message: "" 
});

  const isWeight = itemName.toLowerCase() === "weight";


  const validateExistence = async (data, isEdit = false, originalItem = null) => {
    if (!checkEndpoint) return null;

    try {
      const params = isWeight 
        ? { label: data.label, value: data.value } 
        : { name: data.name };

      const res = await axios.get(checkEndpoint, { params });

      if (res.data.exists) {

        if (isEdit && res.data.id === originalItem._id) {
          return null;
        }
        return `${itemName} already exists`;
      }
    } catch (err) {
      console.error("Validation check failed", err);
    }
    return null;
  };

  useEffect(() => { fetchItems(); }, [endpoint]);


  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(endpoint);
      setItems(res.data);
    } catch (err) { console.error(err); }
  };

  const startEditing = (item) => {
    setError("");
    setEditingId(item._id);
    setEditData(item);
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

const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // 1. Run Existence Check
    const validationError = await validateExistence(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      
      Object.keys(payload).forEach(key => {
        if (typeof payload[key] === 'string') payload[key] = payload[key].trim();
      });

      if (!isWeight && payload.name) {
        payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }

      if (payload.value) payload.value = Number(payload.value);
      
      await axios.post(endpoint, payload);
      setFormData({});
      e.target.reset();
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  const promptDelete = (id) => {
    setConfirmModal({
      show: true,
      type: "DELETE",
      id: id,
      message: `Are you sure you want to delete this ${itemName}? This action cannot be undone.`
    });
  };

  const executeConfirm = async () => {
    const { type, id } = confirmModal;
    setConfirmModal({ ...confirmModal, show: false });
    setError("");

    try {
      if (type === "DELETE") {
        await axios.delete(`${endpoint}/${id}`);
      } else if (type === "UPDATE") {
        const validationError = await validateExistence(editData, true, items.find(i => i._id === id));
        if (validationError) {
          setError(validationError);
          return;
        }

        const payload = { ...editData };
        if (payload.value) payload.value = Number(payload.value);
        if (!isWeight && payload.name) {
          payload.slug = payload.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }

        await axios.put(`${endpoint}/${id}`, payload);
        setEditingId(null);
      }
      fetchItems();
    } catch (err) {
      // Logic to capture the specific backend error message
      const msg = err.response?.data?.message || "Action failed";
      setError(msg);
    }
  };

return (
    <div className="manage-card">
      <div className="card-header">
        <h3>{title}</h3>
        <span className="count-badge">{items.length}</span>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span> {error}
        </div>
      )}
      {/* ... header and form ... */}
      <form onSubmit={handleSubmit} className="attribute-form">
        <div className="input-group">
          {fields.map((field) => (
            <input
              key={field.name}
              name={field.name}
              className="no-spinner"
              type={field.type || "text"}
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              onBlur={() => handleBlur(field.name, false)}
              required
            />
          ))}
          <button className="btn-add" disabled={loading}>{loading ? "..." : "Add"}</button>
        </div>
      </form>
      {/* ... items list and modal ... */}
      <div className="item-list">
        {items.map((item) => (
          <div key={item._id} className={`item-row ${editingId === item._id ? 'is-editing' : ''}`}>
            {editingId === item._id ? (
              <div className="edit-mode">
                {fields.map((field) => (
                  <input
                    key={field.name}
                    className="no-spinner"
                    type={field.type || "text"}
                    value={editData[field.name] || ""}
                    onChange={(e) => setEditData({ ...editData, [field.name]: e.target.value })}
                    onBlur={() => handleBlur(field.name, true)}
                  />
                ))}
                <div className="edit-actions">
                   <button onClick={() => setConfirmModal({show:true, type:'UPDATE', id: item._id, message:'Save changes?'})} className="btn-save">Save</button>
                  <button onClick={() => setEditingId(null)} className="btn-cancel">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="item-info">
                  <div className="item-main">
                    <strong>{item.label || item.name}</strong>
                    {item.value !== undefined && <span className="item-val">{item.value} oz</span>}
                  </div>
                  <code className="item-slug">/{item.slug}</code>
                </div>
                <div className="item-actions">
                  <button onClick={() => { setEditingId(item._id); setEditData(item); }} className="btn-edit">Edit</button>
                  <button onClick={() => promptDelete(item._id)} className="btn-delete">Delete</button>
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
              <h3>Confirm Action</h3>
            </div>
            <div className="modal-body">
              <p>{confirmModal.message}</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setConfirmModal({ show: false, type: null, id: null, message: "" })}
              >
                Cancel
              </button>
              <button 
                className={confirmModal.type === "DELETE" ? "btn-delete-confirm" : "btn-save"} 
                onClick={executeConfirm}
              >
                {confirmModal.type === "DELETE" ? "Delete" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAttributes;