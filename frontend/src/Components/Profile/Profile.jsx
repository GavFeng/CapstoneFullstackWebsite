import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useTranslation } from "react-i18next";
import './Profile.css';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();

  /* ---------- STATE ---------- */
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [popup, setPopup] = useState({ show: false, text: "", type: "" });

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || ""
      });
    }
  }, [user]);

  /* ---------- HELPERS ---------- */

  // Helper to trigger popup
  const showAlert = (text, type = "success") => {
    setPopup({ show: true, text, type });
    setTimeout(() => setPopup({ show: false, text: "", type: "" }), 3000);
  };

  const validateForm = () => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

    if (!emailRegex.test(formData.email)) {
      showAlert(t('profile.invalidEmail'), "error");
      return false;
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      showAlert(t('profile.invalidPhone'), "error");
      return false;
    }

    return true;
  };

  /* ---------- HANDLERS ---------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await updateProfile(formData);
      setIsEditing(false);
      showAlert(t('profile.updateSuccess'), "success");
    } catch (err) {
      showAlert(err.message || t('profile.updateError'), "error");
    }
  };

  /* ----------  JSX ----------  */

  return (
    <div className="profile-wrapper">
      {/* POPUP NOTIFICATION */}
      {popup.show && (
        <div className={`notification-popup ${popup.type}`}>
          {popup.text}
        </div>
      )}

      <div className="profile-header">
        <h1>{t('profile.title')}</h1>
        <p>{t('profile.subtitle')}</p>
      </div>

      <div className="profile-card">
        {!isEditing ? (
          <div className="view-mode">
            <div className="info-grid">
              <div className="info-group">
                <label>{t('profile.fullName')}</label>
                <p>{user?.name}</p>
              </div>
              <div className="info-group">
                <label>{t('profile.emailAddress')}</label>
                <p>{user?.email}</p>
              </div>
              <div className="info-group">
                <label>{t('profile.phoneNumber')}</label>
                <p>{user?.phone || t('profile.notProvided')}</p>
              </div>
              <div className="info-group">
                <label>{t('profile.accountStatus')}</label>
                <p className="status-badge">{user?.accountType?.toUpperCase()}</p>
              </div>
            </div>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              {t('profile.editBtn')}
            </button>
          </div>
        ) : (
          <form className="edit-mode" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group">
                <label>{t('profile.fullName')}</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label>{t('profile.phoneNumber')}</label>
                <input 
                    type="tel"
                    placeholder="123-456-7890"
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label>{t('profile.emailAddress')}</label>
                <input 
                    type="email"
                    required
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
            </div>
            <div className="button-group">
              <button type="submit" className="save-btn">{t('profile.saveBtn')}</button>
              <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                {t('profile.cancelBtn')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile