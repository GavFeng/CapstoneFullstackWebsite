import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || ""
      });
    }
  }, [user]);


  const validateForm = () => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      alert("Please enter a valid phone number (e.g., 123-456-7890).");
      return false;
    }

    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await updateProfile(formData);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h1>Account Settings</h1>
        <p>Manage your profile information and contact details.</p>
      </div>

      <div className="profile-card">
        {!isEditing ? (
          <div className="view-mode">
            <div className="info-grid">
              <div className="info-group">
                <label>Full Name</label>
                <p>{user?.name}</p>
              </div>
              <div className="info-group">
                <label>Email Address</label>
                <p>{user?.email}</p>
              </div>
              <div className="info-group">
                <label>Phone Number</label>
                <p>{user?.phone || "Not provided"}</p>
              </div>
              <div className="info-group">
                <label>Account Status</label>
                <p className="status-badge">{user?.accountType?.toUpperCase()}</p>
              </div>
            </div>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        ) : (
          <form className="edit-mode" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input 
                    type="tel"
                    placeholder="123-456-7890"
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
                </div>

                <div className="input-group">
                <label>Email Address</label>
                <input 
                    type="email"
                    required
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
                </div>
              </div>
            <div className="button-group">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile