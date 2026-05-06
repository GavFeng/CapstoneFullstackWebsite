import React from "react";
import './ImagePopup.css';

//Image Popup to expand small images
const ImagePopup = ({ src, onClose }) => {
  if (!src) return null;

  return (
    <div className="image-popup" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        <img src={src} className="popup-img" alt="Preview" />
      </div>
    </div>
  )
}

export default ImagePopup
