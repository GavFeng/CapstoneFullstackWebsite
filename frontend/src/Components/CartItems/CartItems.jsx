import React, { useContext } from "react";
import { JigContext } from "../../Context/JigContext";
import { Link } from "react-router-dom";
import "./CartItems.css";

const CartItems = () => {

  /* ---------- CONTEXT ---------- */
  const {
    jigs = [],
    cartItems = {},
    setCartQuantity,
    removeAllFromCart,
    cartTotal = 0,
  } = useContext(JigContext);

  /* ---------- STATE ---------- */

  // Convert cart object -> array for rendering
  const cartArray = Object.values(cartItems);

  /* ---------- HELPERS ---------- */

  // Get jig + variant data safely
  const getJigData = (entry) => {
    const jig = jigs.find((j) => j._id === entry.jigId);
    if (!jig) return null;

    const variant = jig.colors.find(
      (v) => v.color._id === entry.colorId
    );
    if (!variant) return null;

    return {
      jig,
      variant,
      colorObj: variant.color,
      imageUrl: variant.images?.[0]?.url || "/placeholder-jig.jpg",
      availableStock: variant.stock ?? 0,
    };
  };

  // Normalize and clean quantity input
  const sanitizeQuantity = (value, maxStock) => {
    const cleaned = value.replace(/\D/g, "").replace(/^0+/, "");
    if (!cleaned) return null;

    const num = Number(cleaned);
    if (num < 1) return 1;

    return Math.min(num, maxStock);
  };

  /* ---------- HANDLERS ---------- */

  // Decrease quantity by 1 (but never below 1)
  const handleDecrease = (entry) => {
    if (entry.quantity > 1) {
      setCartQuantity(
        entry.jigId,
        entry.colorId,
        entry.quantity - 1
      );
    }
  };

  // Increase quantity by 1 (but never exceed available stock)
  const handleIncrease = (entry, maxStock) => {
    if (entry.quantity < maxStock) {
      setCartQuantity(
        entry.jigId,
        entry.colorId,
        entry.quantity + 1
      );
    }
  };

  // Handles and normalizes + cleans manual input
  const handleInputChange = (e, entry, maxStock) => {
    const raw = e.target.value;

    // If user clears input, reset to minimum valid quantity
    if (raw === "") {
      setCartQuantity(entry.jigId, entry.colorId, 1);
      return;
    }

    // Sanitize and validate input before updating state
    const safe = sanitizeQuantity(raw, maxStock);
    if (safe) {
      setCartQuantity(entry.jigId, entry.colorId, safe);
    }
  };

  // Final validation + check when user leaves the input field
  const handleInputBlur = (e, entry, maxStock) => {
    let num =
      e.target.value.trim() === "" || e.target.value === "0"
        ? 1
        : Number(e.target.value.replace(/\D/g, ""));

    // Fallback safety check for invalid numbers
    if (isNaN(num) || num < 1) num = 1;

    // Clamp value to available stock
    const safe = Math.min(num, maxStock);

    setCartQuantity(entry.jigId, entry.colorId, safe);
  };

  /* ---------- JSX ---------- */

  // Empty cart state
  if (cartArray.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <p>Start shopping to add items!</p>
      </div>
    );
  }

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

      {/* Cart Items */}
      <div className="cart-items-list">
        {cartArray.map((entry) => {
          const data = getJigData(entry);
          if (!data) return null;

          const {
            jig,
            colorObj,
            imageUrl,
            availableStock,
          } = data;

          return (
            <div
              key={`${entry.jigId}-${entry.colorId}`}
              className="cart-item"
            >
              {/* Image */}
              <Link 
                to={`/jig/${jig.slug}`} 
                className="cart-item-image-link"
              >
                <div className="cart-item-image">
                  <img src={imageUrl} alt={jig.name} />
                </div>
              </Link>

              {/* Name + color + stock warning */}
              <div className="cart-item-name">
                <p className="name">{jig.name}</p>

                <span
                  className="color-name"
                  style={{ color: colorObj?.slug || "#666" }}
                >
                  {colorObj?.name || "Unknown color"}
                </span>

                {availableStock > 0 && availableStock <= 5 && (
                  <div className="stock-warning">
                    Only {availableStock} left in stock
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="cart-item-price">
                ${jig.price.toFixed(2)}
              </div>

              {/* Quantity Controls */}
              <div className="cart-item-quantity">
                <div
                  className={`quantity-controls ${
                    entry.quantity >= availableStock ? "at-limit" : ""
                  }`}
                >
                  <button
                    className="qty-btn decrease"
                    onClick={() => handleDecrease(entry)}
                    disabled={entry.quantity <= 1}
                  >
                    −
                  </button>

                  <input
                    value={entry.quantity}
                    onChange={(e) =>
                      handleInputChange(e, entry, availableStock)
                    }
                    onBlur={(e) =>
                      handleInputBlur(e, entry, availableStock)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.target.blur();
                    }}
                    className="qty-input"
                  />

                  <button
                    className="qty-btn increase"
                    onClick={() =>
                      handleIncrease(entry, availableStock)
                    }
                    disabled={
                      entry.quantity >= availableStock ||
                      availableStock <= 0
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="cart-item-total">
                ${(jig.price * entry.quantity).toFixed(2)}
              </div>

              {/* Remove */}
              <button
                onClick={() =>
                  removeAllFromCart(entry.jigId, entry.colorId)
                }
                className="remove-btn"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* Summary */}
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

        <button className="checkout-btn">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default CartItems