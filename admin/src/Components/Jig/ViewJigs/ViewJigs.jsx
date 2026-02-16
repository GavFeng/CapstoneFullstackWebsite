import React, { useEffect, useState } from 'react';
import axios from "axios";
import './ViewJigs.css';
import { useNavigate } from "react-router-dom";

import {
  DeleteJig,
  ImagePopup,
  InventoryEditor
} from "../components";

const ViewJigs = () => {
  const navigate = useNavigate();
  const [jigs, setJigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupImage, setPopupImage] = useState(null); 

  const handleDeleteSuccess = (deletedId) => {
    setJigs(prev => prev.filter(j => j._id !== deletedId));
  };

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
      {jigs.map((jig) => {
        const totalSold = jig.colors.reduce((sum, c) => sum + (c.sold || 0), 0);
        const breakdown = jig.colors
          .map(c => `${c.color?.name || "Unnamed"}: ${c.sold || 0} sold`)
          .join("\n");

        return (
          <div key={jig._id} className="jig-card">
            <div className="jig-header">
              <div className="jig-header-left">
                <h3>{jig.name}</h3>
                <p>${jig.price}</p>
              </div>

              <div className="jig-header-right">
                <button
                  type="button"
                  className="edit-btn"
                  onClick={() => navigate(`/editjig/${jig._id}`)}
                >
                  Edit
                </button>
                <DeleteJig
                  jigId={jig._id}
                  jigName={jig.name}
                  onDeleteSuccess={handleDeleteSuccess}
                />
              </div>
            </div>

            <p className="jig-desc">{jig.description}</p>
            <p className="jig-info">
              Category: <strong>{jig.category?.name}</strong> | Weight: <strong>{jig.weight?.label}</strong>
            </p>

            {/* Total Sold  */}
            <div className="jig-total-sold-wrapper">
              <p className="jig-total-sold">
                Total Sold: <strong>{totalSold}</strong>
                <span 
                  className="sold-breakdown-tooltip" 
                  data-tooltip={breakdown || "No sales recorded"}
                >
                  ⓘ
                </span>
              </p>
            </div>

            <div className="colors-section">
              <h4>Colors & Stock:</h4>
              <div className="colors-list">
                {jig.colors.map((c) => (
                  <div key={c.color?._id} className="color-item">
                    <div className="color-info">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: c.color?.slug || "#ccc" }}
                      />
                      <span>{c.color?.name}</span>
                    </div>

                    <div className="stock-center">
                      <InventoryEditor 
                        jigId={jig._id} 
                        colorId={c.color?._id || c.color} 
                        stock={c.stock}
                        sold={c.sold} 
                        onUpdate={(updatedJig) => {
                          setJigs(prev => prev.map(j => j._id === updatedJig._id ? updatedJig : j));
                        }}
                      />
                    </div>
                    <div className="color-images">
                      {c.images?.map((imgObj, idx) => (
                        <img
                          key={imgObj.key || idx}
                          src={imgObj.url}
                          alt={c.color?.name || `color-image-${idx}`}
                          onClick={() => setPopupImage(imgObj.url)} 
                          className="clickable-image"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Popup */}
      {popupImage && <ImagePopup src={popupImage} onClose={() => setPopupImage(null)} />}
    </div>
  );
};

export default ViewJigs;