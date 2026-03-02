import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Item.css";

const Item = ({ id, name, price, colors }) => {
  const firstInStock = useMemo(
    () => colors.find(c => c.stock > 0),
    [colors]
  );

  const [selectedColorId, setSelectedColorId] = useState(
    firstInStock?.color?._id || null
  );

  const selectedColorObj = colors.find(
    c => c.color?._id === selectedColorId
  );

  const imageUrl =
    selectedColorObj?.images?.[0]?.url ||
    colors?.[0]?.images?.[0]?.url;


  const slug = name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');


  return (
    <div className="item-card">

      <div className="item-image-container">
        <Link to={`/jig/${id}/${slug}`}>
          <img
            src={imageUrl}
            alt={name}
            className={`item-image ${!selectedColorId ? "out-of-stock-img" : ""}`}
          />
        </Link>

        {!selectedColorId && (
          <div className="out-of-stock-overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      <p className="item-name">{name}</p>

      <div className="item-price">
        ${price.toFixed(2)}
      </div>

      <div className="color-selector">
        {colors.map((c) => {
          const outOfStock = c.stock === 0;
          const isSelected = selectedColorId === c.color?._id;

          return (
            <button
              key={c.color?._id}
              onClick={() => !outOfStock && setSelectedColorId(c.color?._id)}
              disabled={outOfStock}
              className={`color-dot-item ${isSelected ? "selected" : ""}`}
              style={{
                backgroundColor: c.color?.slug || "#ccc",
                opacity: outOfStock ? 0.5 : 1,
              }}
              title={outOfStock ? "Out of stock" : `${c.stock} left`}
            >
              {outOfStock && <span className="color-x">⃠</span>}
            </button>
          );
        })}
      </div>
    </div>
  )
}

export default Item