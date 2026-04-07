import React, { useContext, useEffect, useState, useMemo } from "react";
import { JigContext } from "../../Context/JigContext";
import { useAuth } from "../../Context/AuthContext";
import api from "../../Services/Api";
import "./Checkout.css";

const Checkout = () => {
  const { 
    cartItems, 
    jigs, 
    clearCart,
    removePurchasedItems,
    refreshJigs,
    setCartQuantity,
    getAvailableStock
  } = useContext(JigContext);
  
  const { token } = useAuth();

  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  // Sync selected items with cart
  useEffect(() => {
    setSelectedItems(Object.values(cartItems));
  }, [cartItems]);

  // Logic: Identify out of stock items
  const outOfStockWarnings = useMemo(() => {
    return Object.values(cartItems).filter((entry) => {
      const available = getAvailableStock?.(entry.jigId, entry.colorId) ?? 0;
      return entry.quantity > available || available === 0;
    });
  }, [cartItems, jigs, getAvailableStock]);

  const toggleItem = (entry) => {
    setSelectedItems((prev) => {
      const exists = prev.find(
        (i) => i.jigId === entry.jigId && i.colorId === entry.colorId
      );
      if (exists) {
        return prev.filter((i) => !(i.jigId === entry.jigId && i.colorId === entry.colorId));
      }
      return [...prev, entry];
    });
  };

  const selectedTotal = useMemo(() => {
    return selectedItems.reduce((sum, entry) => {
      const jig = jigs.find((j) => j._id === entry.jigId);
      return jig ? sum + jig.price * entry.quantity : sum;
    }, 0);
  }, [selectedItems, jigs]);

  const handleSubmit = async () => {
    if (!location || !pickupDate) return setMessage("Please select pickup location and date");
    if (selectedItems.length === 0) return setMessage("No items selected");
    if (outOfStockWarnings.length > 0) return setMessage("Please adjust out-of-stock items first.");

    try {
      setLoading(true);
      setMessage("");

      const items = selectedItems.map((item) => ({
        jig: item.jigId,
        color: item.colorId,
        quantity: item.quantity,
      }));

      const orderData = {
        items,
        totalAmount: selectedTotal,
        deliveryMethod: "pickup",
        pickupDetails: { location, pickupDate },
      };

      await api.post("/order", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (selectedItems.length === Object.values(cartItems).length) {
        clearCart();
      } else {
        removePurchasedItems(items);
      }

      setMessage("Order placed successfully!");
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === "OUT_OF_STOCK") {
        setMessage("Stock levels changed. Cart updated.");
        await refreshJigs();
        selectedItems.forEach((item) => {
          const available = getAvailableStock?.(item.jigId, item.colorId) ?? 0;
          if (item.quantity > available && available > 0) {
            setCartQuantity(item.jigId, item.colorId, available);
          }
        });
      } else {
        setMessage(err.response?.data?.message || "Error placing order");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-container">
        <h1>Checkout (Pickup)</h1>

        {outOfStockWarnings.length > 0 && (
          <div className="stock-error">
            ⚠️ Some items are unavailable. Please return to your cart to adjust quantities.
          </div>
        )}

        <div className="checkout-section">
          <label>Pickup Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Select Location</option>
            <option value="Seattle Store">Seattle Store</option>
            <option value="Warehouse">Warehouse</option>
          </select>
        </div>

        <div className="checkout-section">
          <label>Pickup Date & Time</label>
          <input
            type="datetime-local"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
          />
        </div>

        <div className="checkout-items">
          <h2>Select Items to Purchase</h2>
          {Object.values(cartItems).map((entry) => {
            const jig = jigs.find(j => j._id === entry.jigId);
            if (!jig) return null;

            const available = getAvailableStock?.(entry.jigId, entry.colorId) ?? 0;
            const isOutOfStock = entry.quantity > available || available === 0;
            const isSelected = selectedItems.some(i => i.jigId === entry.jigId && i.colorId === entry.colorId);

            return (
              <div key={`${entry.jigId}-${entry.colorId}`} className={`checkout-item ${isOutOfStock ? 'out-of-stock' : ''}`}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleItem(entry)}
                  disabled={isOutOfStock}
                />
                <span className="item-name">{jig.name}</span>
                <span className="item-price">
                  x{entry.quantity} (${(jig.price * entry.quantity).toFixed(2)})
                  {isOutOfStock && <span className="oos-label"> (Out of Stock)</span>}
                </span>
              </div>
            );
          })}
        </div>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <p className="total-amount">Total: ${selectedTotal.toFixed(2)}</p>
        </div>

        <button
          className="place-order-btn"
          onClick={handleSubmit}
          disabled={loading || outOfStockWarnings.length > 0}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>

        {message && (
          <p className={`checkout-message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Checkout;