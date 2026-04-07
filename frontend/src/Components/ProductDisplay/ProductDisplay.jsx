import React, { useState, useMemo, useContext } from 'react';
import { JigContext } from '../../Context/JigContext';
import './ProductDisplay.css';

const ProductDisplay = ({ jig }) => {

  /* ---------- CONTEXT ---------- */
  const { addToCart } = useContext(JigContext);

  /* ---------- STATE ---------- */
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const variants = jig?.colors || [];
  const selectedVariant = variants[selectedVariantIndex] || null;
  const mainImage =
    selectedVariant?.images?.[0]?.url || '';
  const thumbnails =
    selectedVariant?.images?.slice(0, 4) || [];
  const stock = selectedVariant?.stock ?? 0;
  const isOutOfStock = stock === 0;


  /* ---------- HELPERS ---------- */
  // Find first available variant (used for auto-selection)
  const firstInStockIndex = useMemo(
    () => variants.findIndex(v => (v.stock ?? 0) > 0),
    [variants]
  );

  /* ---------- EFFECTS ---------- */
  // Use first in-stock variant if default selection is out of stock
  React.useEffect(() => {
    if (
      firstInStockIndex !== -1 &&
      selectedVariantIndex === 0 &&
      stock === 0
    ) {
      setSelectedVariantIndex(firstInStockIndex);
    }
  }, [firstInStockIndex, selectedVariantIndex, stock]);


  /* ---------- HANDLERS ---------- */

  // Decrease quantity (min = 1)
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  // Increase quantity (max = available stock)
  const handleIncrease = () => {
    if (quantity < stock) {
      setQuantity(q => q + 1);
    }
  };

  // Handles and normalizes + cleans manual input
  const handleQuantityInput = (e) => {
    const value = e.target.value;

    // Remove non-digits and leading zeros
    const cleaned = value.replace(/\D/g, '').replace(/^0+/, '');

    // Default to 1 if empty
    const num = cleaned === '' ? 1 : Number(cleaned);

    // Clamp between 1 and stock
    setQuantity(Math.min(num, stock) || 1);
  };

  // Add selected variant + quantity to cart
  const handleAddToCart = async () => {
    if (isOutOfStock || !selectedVariant || quantity < 1) return;

    addToCart(
      jig._id,
      selectedVariant.color._id,
      quantity
    );
  };


  /* ---------- JSX ---------- */
  return (
    <div className="product-display">

      {/* ---------- IMAGE SECTION ---------- */}
      <div className="image-section">

        {/* Thumbnail previews */}
        <div className="thumbnails">
          {thumbnails.length > 0 ? (
            thumbnails.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`${jig?.name || 'Product'} thumbnail ${idx + 1}`}
                className="thumbnail"
              />
            ))
          ) : (
            <div className="no-thumbnails">
              No images available
            </div>
          )}
        </div>

        {/* Main product image */}
        <div className="main-image-wrapper">
          <img
            src={mainImage}
            alt={jig?.name || 'Product'}
            className="main-image"
          />
        </div>
      </div>


      {/* ---------- INFO SECTION ---------- */}
      <div className="info-section">

        {/* Product name */}
        <h1 className="product-title">
          {jig?.name || 'Unnamed Product'}
        </h1>

        {/* Price + stock status */}
        <div className="price-stock">
          <div className="price">
            ${jig?.price?.toFixed(2) || '—'}
          </div>

          {/* Dynamic stock messaging */}
          <div className={`stock ${isOutOfStock ? 'out-of-stock' : ''}`}>
            {isOutOfStock
              ? 'Out of stock'
              : stock <= 3
                ? `Only ${stock} left!`
                : `${stock} in stock`}
          </div>
        </div>

        {/* Description */}
        {jig?.description && (
          <div className="short-description">
            {jig.description}
          </div>
        )}

        {/* ---------- COLOR SELECTOR ---------- */}
        <div className="page-color-selector">
          <h3>Select Color</h3>

          <div className="color-dots">
            {variants.length === 0 ? (
              <p>No colors available</p>
            ) : (
              variants.map((variant, index) => {
                const colorObj = variant.color;
                const outOfStock = (variant.stock ?? 0) === 0;
                const isSelected = selectedVariantIndex === index;

                const backgroundColor =
                  colorObj?.slug || '#ccc';

                return (
                  <button
                    key={variant._id || index}
                    type="button"
                    aria-label={`Select ${colorObj?.name || 'color'} – ${
                      outOfStock
                        ? 'out of stock'
                        : `${variant.stock} available`
                    }`}

                    disabled={outOfStock}

                    // Switch variant + reset quantity
                    onClick={() => {
                      setSelectedVariantIndex(index);
                      setQuantity(1);
                    }}

                    className={`color-dot ${
                      isSelected ? 'selected' : ''
                    } ${outOfStock ? 'out-of-stock' : ''}`}

                    style={{ backgroundColor }}

                    // Tooltip for stock info
                    title={
                      outOfStock
                        ? 'Out of stock'
                        : `${variant.stock} left`
                    }
                  >
                    {/* Cross overlay for out-of-stock variants */}
                    {outOfStock && <span className="cross">✕</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>


        {/* ---------- QUANTITY SELECTOR ---------- */}
        {/* Only visible when item is in stock */}
        {!isOutOfStock && (
          <div className="quantity-selector">
            <label htmlFor="quantity">Quantity</label>

            <div className="quantity-controls">
              <button
                className="qty-btn decrease"
                onClick={handleDecrease}
                disabled={quantity <= 1}
              >
                −
              </button>

              <input
                id="quantity"
                value={quantity}
                onChange={handleQuantityInput}
                className="qty-input"
              />

              <button
                className="qty-btn increase"
                onClick={handleIncrease}
                disabled={quantity >= stock}
              >
                +
              </button>
            </div>
          </div>
        )}


        {/* ---------- ADD TO CART ---------- */}
        <button
          className={`add-to-cart-btn ${
            isOutOfStock || quantity < 1
              ? 'disabled'
              : 'active'
          }`}
          disabled={isOutOfStock || quantity < 1}
          onClick={handleAddToCart}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>


        {/* ---------- META INFO ---------- */}
        <div className="meta">
          {jig?.category && (
            <p>
              <strong>Category:</strong> {jig.category.name}
            </p>
          )}
          {jig?.weight && (
            <p>
              <strong>Weight:</strong> {jig.weight.label}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProductDisplay