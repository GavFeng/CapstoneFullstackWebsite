import React, { useContext } from 'react';
import { JigContext } from '../../Context/JigContext';
import './CartItems.css';

const CartItems = () => {
  const context = useContext(JigContext);

  const {
    jigs = [],
    cartItems = {},
    removeFromCart,
    addToCart,
    removeAllFromCart,
    cartTotal = 0,
  } = context;

  const cartArray = Object.values(cartItems);

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
          const jig = jigs.find((j) => j._id === entry.jigId);
          if (!jig) return null;

          const variant = jig.colors.find((v) => v.color._id === entry.colorId);
          if (!variant) return null;

          const colorObj = variant.color;
          const imageUrl = variant.images?.[0]?.url || '/placeholder-jig.jpg';
          const availableStock = variant.stock ?? 0;

          return (
            <div key={`${entry.jigId}-${entry.colorId}`} className="cart-item">
            <div className="cart-item-image">
                <img src={imageUrl} alt={jig.name} />
            </div>

            <div className="cart-item-name">
                <p className="name">{jig.name}</p>
                <span
                className="color-name"
                style={{ color: colorObj?.slug || '#666' }}
                >
                {colorObj?.name || 'Unknown color'}
                </span>
                {availableStock > 0 && availableStock <= 5 && (
                <div className="stock-warning">
                    Only {availableStock} left in stock
                </div>
                )}
            </div>

            <div className="cart-item-price">
                ${jig.price.toFixed(2)}
            </div>

            <div className="cart-item-quantity">
              <div className={`quantity-controls ${entry.quantity >= availableStock ? 'at-limit' : ''}`}>

                <button
                  type="button"
                  className="qty-btn decrease"
                  onClick={() => {
                    if (entry.quantity > 1) {
                      context.setCartQuantity(entry.jigId, entry.colorId, entry.quantity - 1);
                    }
                  }}
                  disabled={entry.quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={entry.quantity}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                      context.setCartQuantity(entry.jigId, entry.colorId, 1);
                      return;
                    }

                    const cleaned = raw.replace(/\D/g, '').replace(/^0+/, '');
                    if (cleaned === '') return;

                    const num = Number(cleaned);
                    if (num < 1) return;

                    const capped = Math.min(num, availableStock);
                    context.setCartQuantity(entry.jigId, entry.colorId, capped);
                  }}
                  onBlur={(e) => {
                    const raw = e.target.value.trim();
                    let num = raw === '' || raw === '0' ? 1 : Number(raw.replace(/\D/g, ''));
                    if (isNaN(num) || num < 1) num = 1;
                    const safe = Math.min(num, availableStock);
                    context.setCartQuantity(entry.jigId, entry.colorId, safe);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.target.blur();
                    }
                  }}
                  className="qty-input"
                  aria-label="Quantity"
                />

                <button
                  type="button"
                  className="qty-btn increase"
                  onClick={() => {
                    if (entry.quantity < availableStock) {
                      context.setCartQuantity(entry.jigId, entry.colorId, entry.quantity + 1);
                    }
                  }}
                  disabled={entry.quantity >= availableStock || availableStock <= 0}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="cart-item-total">
                ${(jig.price * entry.quantity).toFixed(2)}
            </div>

            <button
                onClick={() => context.removeAllFromCart(entry.jigId, entry.colorId)}
                className="remove-btn"
                aria-label="Remove item completely"
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

        {/* <div className="promo-section">
          <label htmlFor="promo">Promo Code</label>
          <div className="promo-input-group">
            <input
              id="promo"
              type="text"
              placeholder="Enter promo code"
            />
            <button type="button">Apply</button>
          </div>
        </div> */}

        <button className="checkout-btn">
          Proceed to Checkout
        </button>
      </div>
    </div>
  )
}

export default CartItems