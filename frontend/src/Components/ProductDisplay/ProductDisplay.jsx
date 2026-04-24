import React, { useState, useMemo, useContext } from 'react';
import { JigContext } from '../../Context/JigContext';
import { useTranslation } from "react-i18next";
import './ProductDisplay.css';

const ProductDisplay = ({ jig }) => {

  const { t } = useTranslation();
  /* ---------- CONTEXT ---------- */
  const { addToCart } = useContext(JigContext);

  /* ---------- STATE ---------- */
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

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

    const colorId = selectedVariant.color?._id || selectedVariant.color;

    addToCart(
      jig._id,
      colorId,
      quantity
    );

    console.log({
      attemptingJig: jig._id,
      attemptingColor: colorId,
      availableFound: quantity,
    });
    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };


  /* ---------- JSX ---------- */
  return (
    <div className="product-display">
      {/* ---------- IMAGE SECTION ---------- */}
      <div className="image-section">
        <div className="thumbnails">
          {thumbnails.length > 0 ? (
            thumbnails.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                // Translate alt text placeholders
                alt={t('product.thumbnailAlt', { name: jig?.name || t('product.defaultName'), index: idx + 1 })}
                className="thumbnail"
              />
            ))
          ) : (
            <div className="no-thumbnails">{t('product.noImages')}</div>
          )}
        </div>

        <div className="main-image-wrapper">
          <img
            src={mainImage}
            alt={jig?.name || t('product.defaultName')}
            className="main-image"
          />
        </div>
      </div>

      {/* ---------- INFO SECTION ---------- */}
      <div className="info-section">
        <h1 className="product-title">
          {jig?.name || t('product.unnamed')}
        </h1>

        <div className="price-stock">
          <div className="price">
            ${jig?.price?.toFixed(2) || '—'}
          </div>

          {/* Dynamic stock messaging using logic-based keys */}
          <div className={`stock ${isOutOfStock ? 'out-of-stock' : ''}`}>
            {isOutOfStock
              ? t('product.outOfStock')
              : stock <= 3
                ? t('product.lowStock', { count: stock })
                : t('product.inStock', { count: stock })}
          </div>
        </div>

        {/* ---------- COLOR SELECTOR ---------- */}
        <div className="page-color-selector">
          <h3>{t('product.selectColor')}</h3>
          <div className="color-dots">
            {variants.length === 0 ? (
              <p>{t('product.noColors')}</p>
            ) : (
              variants.map((variant, index) => {
                const colorObj = variant.color;
                const outOfStock = (variant.stock ?? 0) === 0;
                const isSelected = selectedVariantIndex === index;

                return (
                  <button
                    key={variant._id || index}
                    type="button"
                    // Accessibility labels
                    aria-label={t('product.colorAria', { 
                      color: colorObj?.name || t('product.defaultColor'), 
                      status: outOfStock ? t('product.outOfStock') : t('product.countAvailable', { count: variant.stock }) 
                    })}
                    disabled={outOfStock}
                    onClick={() => {
                      setSelectedVariantIndex(index);
                      setQuantity(1);
                    }}
                    className={`color-dot ${isSelected ? 'selected' : ''} ${outOfStock ? 'out-of-stock' : ''}`}
                    style={{ backgroundColor: colorObj?.slug || '#ccc' }}
                    title={outOfStock ? t('product.outOfStock') : t('product.lowStock', { count: variant.stock })}
                  >
                    {outOfStock && <span className="cross">✕</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ---------- QUANTITY ---------- */}
        {!isOutOfStock && (
          <div className="quantity-selector">
            <label htmlFor="quantity">{t('product.quantity')}</label>
            <div className="quantity-controls">
              <button className="qty-btn" onClick={handleDecrease} disabled={quantity <= 1}>−</button>
              <input id="quantity" value={quantity} onChange={handleQuantityInput} className="qty-input" />
              <button className="qty-btn" onClick={handleIncrease} disabled={quantity >= stock}>+</button>
            </div>
          </div>
        )}

        {/* ---------- ADD TO CART ---------- */}
        <button
          className={`add-to-cart-btn ${isOutOfStock || quantity < 1 ? 'disabled' : isAdded ? 'added' : 'active'}`}
          disabled={isOutOfStock || quantity < 1 || isAdded}
          onClick={handleAddToCart}
        >
          {isOutOfStock ? t('product.outOfStock') : isAdded ? t('product.addedToCart') : t('product.addToCart')}
        </button>

        {/* ---------- META ---------- */}
        <div className="meta">
          {jig?.category && <p><strong>{t('product.categoryLabel')}:</strong> {jig.category.name}</p>}
          {jig?.weight && <p><strong>{t('product.weightLabel')}:</strong> {jig.weight.label}</p>}
        </div>
      </div>
    </div>
  );
}

export default ProductDisplay