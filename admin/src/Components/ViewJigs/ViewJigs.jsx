import React, { useEffect, useState } from 'react'
import axios from "axios"
import './ViewJigs.css'

const ViewJigs = () => {
  const [jigs, setJigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupImage, setPopupImage] = useState(null); 

    useEffect(() => {
      const fetchJigs = async () => {
        try {
          const res = await axios.get("http://localhost:4000/api/jigs");
          setJigs(res.data);
        } catch (err) {
          console.error("Error fetching jigs:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchJigs();
    }, []);

    if (loading) return <p>Loading jigs...</p>;
    if (!jigs.length) return <p>No jigs found</p>;

  return (
    <div className="jigs-container">
      {jigs.map((jig) => (
        <div key={jig._id} className="jig-card">
          <div className="jig-header">
            <h3>{jig.name}</h3>
            <p>${jig.price}</p>
          </div>
          <p className="jig-desc">{jig.description}</p>
          <p className="jig-info">
            Category: <strong>{jig.category?.name}</strong> | Weight: <strong>{jig.weight?.label}</strong>
          </p>

          <div className="colors-section">
            <h4>Colors & Stock:</h4>
            <div className="colors-list">
              {jig.colors.map((c) => (
                <div key={c.color?._id} className="color-item">
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: c.color?.slug || "#ccc" }}
                  />
                  <span>{c.color?.name}</span>
                  <span className="stock">Stock: {c.stock}</span>
                  <div className="color-images">
                    {c.image?.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={c.color?.name}
                        onClick={() => setPopupImage(img)} 
                        className="clickable-image"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {popupImage && (
        <div className="image-popup" onClick={() => setPopupImage(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setPopupImage(null)}>×</button>
            <img src={popupImage} alt="Popup" className="popup-img" />
          </div>
        </div>
      )}
            
    </div>
  )
}

export default ViewJigs