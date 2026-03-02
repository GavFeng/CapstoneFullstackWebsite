import React, { useState, useMemo, useContext } from 'react';
import { JigContext } from '../../Context/JigContext';
import './ProductDisplay.css';

const ProductDisplay = ({ jig }) => {
  const { addToCart } = useContext(JigContext);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const variants = jig?.colors || [];
  const selectedVariant = variants[selectedVariantIndex] || null;

  const mainImage = selectedVariant?.images?.[0]?.url || '/placeholder-jig.jpg';
  const thumbnails = selectedVariant?.images?.slice(0, 4) || [];

  const stock = selectedVariant?.stock ?? 0;
  const isOutOfStock = stock === 0;

  const firstInStockIndex = useMemo(
    () => variants.findIndex(v => (v.stock ?? 0) > 0),
    [variants]
  );

  React.useEffect(() => {
    if (
      firstInStockIndex !== -1 &&
      selectedVariantIndex === 0 &&
      stock === 0
    ) {
      setSelectedVariantIndex(firstInStockIndex);
    }
  }, [firstInStockIndex, selectedVariantIndex, stock]);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleIncrease = () => {
    if (quantity < stock) setQuantity(q => q + 1);
  };

  const handleQuantityInput = (e) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '').replace(/^0+/, '');
    const num = cleaned === '' ? 1 : Number(cleaned);
    setQuantity(Math.min(num, stock) || 1);
  };

  const handleAddToCart = () => {
    if (isOutOfStock || !selectedVariant || quantity < 1) return;
    addToCart(jig._id, selectedVariant.color._id, quantity);
  };

  return (
    <div className="product-display">
      <div className="image-section">
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
            <div className="no-thumbnails">No images available</div>
          )}
        </div>

        <div className="main-image-wrapper">
          <img
            src={mainImage}
            alt={jig?.name || 'Product'}
            className="main-image"
          />
        </div>
      </div>

      <div className="info-section">
        <h1 className="product-title">{jig?.name || 'Unnamed Product'}</h1>

        <div className="price-stock">
          <div className="price">
            ${jig?.price?.toFixed(2) || '—'}
          </div>
          <div className={`stock ${isOutOfStock ? 'out-of-stock' : ''}`}>
            {isOutOfStock
              ? 'Out of stock'
              : stock <= 3
                ? `Only ${stock} left!`
                : `${stock} in stock`}
          </div>
        </div>

        {jig?.description && (
          <div className="short-description">{jig.description}</div>
        )}

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

                const backgroundColor = colorObj?.slug || '#ccc';

                return (
                  <button
                    key={variant._id || index}
                    type="button"
                    aria-label={`Select ${colorObj?.name || 'color'} – ${
                      outOfStock ? 'out of stock' : `${variant.stock} available`
                    }`}
                    disabled={outOfStock}
                    onClick={() => {
                      setSelectedVariantIndex(index);
                      setQuantity(1); // reset quantity when color changes
                    }}
                    className={`color-dot ${isSelected ? 'selected' : ''} ${
                      outOfStock ? 'out-of-stock' : ''
                    }`}
                    style={{ backgroundColor }}
                    title={
                      outOfStock
                        ? 'Out of stock'
                        : `${variant.stock} left`
                    }
                  >
                    {outOfStock && <span className="cross">✕</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Quantity Selector – only show when in stock */}
        {!isOutOfStock && (
          <div className="quantity-selector">
            <label htmlFor="quantity">Quantity</label>
            <div className="quantity-controls">
              <button
                type="button"
                className="qty-btn decrease"
                onClick={handleDecrease}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>

              <input
                id="quantity"
                type="text"
                inputMode="numeric"
                value={quantity}
                onChange={handleQuantityInput}
                className="qty-input"
                min="1"
                max={stock}
                aria-label="Quantity"
              />

              <button
                type="button"
                className="qty-btn increase"
                onClick={handleIncrease}
                disabled={quantity >= stock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Add to Cart button */}
        <button
          className={`add-to-cart-btn ${isOutOfStock || quantity < 1 ? 'disabled' : 'active'}`}
          disabled={isOutOfStock || quantity < 1}
          onClick={handleAddToCart}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>

        <div className="meta">
          {jig?.category && <p><strong>Category:</strong> {jig.category.name}</p>}
          {jig?.weight && <p><strong>Weight:</strong> {jig.weight.label}</p>}
        </div>
      </div>
    </div>
  )
}

export default ProductDisplay