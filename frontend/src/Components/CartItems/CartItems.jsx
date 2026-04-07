import React, { useContext } from "react";
import { JigContext } from "../../Context/JigContext";
import { useNavigate, Link } from "react-router-dom";
import "./CartItems.css";

const CartItems = () => {
  const {
    jigs = [],
    cartItems = {},
    savedItems = [],
    setCartQuantity,
    removeAllFromCart,
    saveForLater,
    moveToCart,
    removeSavedItem,
    cartTotal = 0,
    refreshJigs,
    getAvailableStock,
  } = useContext(JigContext);

  const navigate = useNavigate();
  const cartArray = Object.values(cartItems);

  /* ---------- HELPERS ---------- */
  const getJigData = (entry) => {
    const jig = jigs.find((j) => j._id === entry.jigId);
    if (!jig) return null;
    const variant = jig.colors.find((v) => v.color._id === entry.colorId);
    if (!variant) return null;
    return {
      jig,
      variant,
      colorObj: variant.color,
      imageUrl: variant.images?.[0]?.url,
      availableStock: variant.stock ?? 0,
    };
  };

  const getSavedJigData = (savedItem) => {
    const jigId = savedItem.jig?._id || savedItem.jig;
    const colorId = savedItem.color?._id || savedItem.color;

    const jig = jigs.find((j) => j._id === jigId);
    if (!jig) return null;

    const variant = jig.colors.find((v) => v.color._id === colorId);
    if (!variant) return null;

    return {
      jig,
      colorObj: variant.color,
      imageUrl: variant.images?.[0]?.url,
      availableStock: variant.stock ?? 0,
    };
  };

  const hasInvalidItems = cartArray.some((entry) => {
    const data = getJigData(entry);
    if (!data) return true;
    return (
      data.availableStock === 0 ||
      entry.quantity > data.availableStock
    );
  });

  /* ---------- HANDLERS ---------- */
  const handleDecrease = (entry, availableStock) => {
    if (entry.quantity > availableStock && availableStock > 0) {
      setCartQuantity(entry.jigId, entry.colorId, availableStock);
    } else if (entry.quantity > 1) {
      setCartQuantity(entry.jigId, entry.colorId, entry.quantity);
    }
  };

  const handleIncrease = (entry, maxStock) => {
    if (entry.quantity < maxStock) {
      setCartQuantity(entry.jigId, entry.colorId, entry.quantity + 1);
    }
  };

  const sanitizeQuantity = (value, maxStock) => {
    const cleaned = value.replace(/\D/g, "").replace(/^0+/, "");
    if (!cleaned) return null;
    const num = Number(cleaned);
    if (num < 1) return 1;
    return Math.min(num, maxStock);
  };

  const handleInputChange = (e, entry, maxStock) => {
    const raw = e.target.value;
    if (raw === "") {
      setCartQuantity(entry.jigId, entry.colorId, 1);
      return;
    }
    const safe = sanitizeQuantity(raw, maxStock);
    if (safe) setCartQuantity(entry.jigId, entry.colorId, safe);
  };

  const handleInputBlur = (e, entry, maxStock) => {
    let num = e.target.value.trim() === "" || e.target.value === "0"
      ? 1
      : Number(e.target.value.replace(/\D/g, ""));
    if (isNaN(num) || num < 1) num = 1;
    const safe = Math.min(num, maxStock);
    setCartQuantity(entry.jigId, entry.colorId, safe);
  };

  const handleCheckout = async () => {
    await refreshJigs();
    const invalid = cartArray.some((entry) => {
      const available = getAvailableStock(entry.jigId, entry.colorId);
      return available === 0 || entry.quantity > available;
    });
    if (invalid) return;
    navigate("/checkout");
  };

  /* ---------- JSX ---------- */
  
  // if (cartArray.length === 0 && savedItems.length === 0) {
  //   return (
  //     <div className="cart-empty">
  //       <h2>Your cart is empty</h2>
  //       <p>Start shopping to add items!</p>
  //     </div>
  //   );
  // }

return (
    <div className="cart-container">
      {/* Header */}
      <div className="cart-header mobile-only">
        <h1>Cart</h1>
        <div className="underline"></div>
      </div>

      {/* Desktop Table Header */}
      <div className="cart-header desktop-only">
        <div>Product</div>
        <div></div>
        <div>Price</div>
        <div>Quantity</div>
        <div>Total</div>
        <div></div>
      </div>

      {/* Main Cart Items List */}
      <div className="cart-items-list">
        {cartArray.map((entry) => {
          const data = getJigData(entry);
          if (!data) return null;
          const { jig, colorObj, imageUrl, availableStock } = data;

          return (
            <div key={`${entry.jigId}-${entry.colorId}`} className="cart-item">
              <Link to={`/jig/${jig.slug}`} className="cart-item-image-link">
                <div className="cart-item-image">
                  <img src={imageUrl} alt={jig.name} />
                </div>
              </Link>

              <div className="cart-item-name">
                <p className="name">{jig.name}</p>
                <span className="color-name" style={{ color: colorObj?.slug || "#666" }}>
                  {colorObj?.name || "Unknown color"}
                </span>
                  {availableStock === 0 ? (
                    <p className="stock-warning out">Out of Stock</p>
                  ) : availableStock <= 5 ? (
                    <p className="stock-warning low">Only {availableStock} left</p>
                  ) : null}
              </div>

              <div className="cart-item-price">${jig.price.toFixed(2)}</div>

              <div className="cart-item-quantity">
                <div className={`quantity-controls ${entry.quantity > availableStock ? "at-limit" : ""}`}>
                  <button 
                    className="qty-btn decrease" 
                    onClick={() => handleDecrease(entry, availableStock)} 
                    disabled={entry.quantity <= 1}
                  >
                    −
                  </button>
                  
                  <input
                    value={entry.quantity}
                    onChange={(e) => handleInputChange(e, entry, availableStock)}
                    onBlur={(e) => handleInputBlur(e, entry, availableStock)}
                    className="qty-input"
                  />

                  <button 
                    className="qty-btn increase" 
                    onClick={() => handleIncrease(entry, availableStock)} 
                    disabled={entry.quantity >= availableStock || availableStock <= 0}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-item-total">
                ${(jig.price * entry.quantity).toFixed(2)}
              </div>

              <div className="cart-item-actions">
                <button
                  onClick={() => saveForLater(entry.jigId, entry.colorId)}
                  className="icon-btn tooltip-container"
                  data-tooltip="Save for Later"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </button>
                <button onClick={() => removeAllFromCart(entry.jigId, entry.colorId)} className="remove-btn">✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== FOOTER SECTION (Saved + Summary) ==================== */}
      <div className="cart-footer-flex">
        
        {/* MINI SAVED ITEMS SECTION */}
        <div className="saved-items-mini-section">
          {savedItems.length > 0 && (
            <>
              <h2>Saved for Later ({savedItems.length})</h2>
              <div className="saved-items-mini-list">
                {savedItems.map((savedItem) => {
                  const data = getSavedJigData(savedItem);
                  if (!data) return null;
                  const { jig, colorObj, imageUrl, availableStock} = data;
                  const jigId = savedItem.jig?._id || savedItem.jig;
                  const colorId = savedItem.color?._id || savedItem.color;

                  return (
                    <div key={`${jigId}-${colorId}`} className="saved-item-mini">
                      <img src={imageUrl} alt={jig.name} className="mini-img" />
                      <div className="mini-info">
                        <p className="mini-name">{jig.name}</p>
                        {/* Added Color Info below */}
                        <div className="mini-color-row">
                          <span className="mini-color-name" style={{ color: colorObj?.slug || "#666" }}>
                            {colorObj?.name || "Unknown color"}
                          </span>
                        </div>
                        <p className="mini-price">${jig.price.toFixed(2)}</p>
                          {availableStock === 0 ? (
                            <p className="mini-stock-warning out">Out of Stock</p>
                          ) : availableStock <= 5 ? (
                            <p className="mini-stock-warning low">Only {availableStock} left</p>
                          ) : null}
                        <div className="mini-actions">
                          <button 
                            onClick={() => moveToCart(jigId, colorId)} 
                            className="move-link"
                            disabled={availableStock === 0}
                          >
                            Move to Cart
                          </button>
                          <button onClick={() => removeSavedItem(jigId, colorId)} className="remove-link">Remove</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* SUMMARY SECTION */}
        {cartArray.length > 0 && (
          <div className="cart-summary">
            <h2>Cart Total</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            {hasInvalidItems && (
              <div className="checkout-warning">
                Stock levels have changed. Please update quantity.
              </div>
            )}

            <button className="checkout-btn" onClick={handleCheckout} disabled={hasInvalidItems}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartItems