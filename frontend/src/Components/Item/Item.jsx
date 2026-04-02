import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Item.css";

{/* Item Compontent for Displaying Products */}
const Item = ({ id, name, price, colors }) => {

  /* ---------- STATE ---------- */

  // Find the first available (in-stock) color to use as default
  const firstInStock = useMemo(
    () => colors.find(c => c.stock > 0),
    [colors]
  );

  /* ---------- STATE ---------- */

  // Currently selected color (defaulted to first in-stock variant)
  const [selectedColorId, setSelectedColorId] = useState(
    firstInStock?.color?._id || null
  );

  /* ---------- HELPERS ---------- */

  // Get full color object for the selected color
  const selectedColorObj = colors.find(
    c => c.color?._id === selectedColorId
  );

  // Determine which image to display
  const imageUrl =
    selectedColorObj?.images?.[0]?.url ||
    colors?.[0]?.images?.[0]?.url;

  // Generate URL-friendly slug
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');


  /* ---------- JSX ---------- */

  return (
    <div className="item-card">

      {/* Product Image */}
      <div className="item-image-container">
        <Link to={`/jig/${slug || id}`}>
          <img
            src={imageUrl}
            alt={name}
            // Grey out image if no variants are in stock
            className={`item-image ${!selectedColorId ? "out-of-stock-img" : ""}`}
          />
        </Link>

        {/* Overlay shown if all variants are out of stock */}
        {!selectedColorId && (
          <div className="out-of-stock-overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Name */}
      <p className="item-name">{name}</p>

      {/* Price */}
      <div className="item-price">
        ${price.toFixed(2)}
      </div>

      {/* Color Selector */}
      <div className="color-selector">
        {colors.map((c) => {
          const outOfStock = c.stock === 0;
          const isSelected = selectedColorId === c.color?._id;

          return (
            <button
              key={c.color?._id}

              // Only allow selection if variant is in stock
              onClick={() =>
                !outOfStock && setSelectedColorId(c.color?._id)
              }

              disabled={outOfStock}

              className={`color-dot-item ${
                isSelected ? "selected" : ""
              }`}

              // Use color slug for visual swatch
              style={{
                backgroundColor: c.color?.slug || "#ccc",
                opacity: outOfStock ? 0.5 : 1,
              }}

              // Tooltip shows stock info
              title={
                outOfStock
                  ? "Out of stock"
                  : `${c.stock} left`
              }
            >
              {/* Overlay X for out-of-stock variants */}
              {outOfStock && (
                <span className="color-x">⃠</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Item