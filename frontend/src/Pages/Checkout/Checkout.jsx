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
    getAvailableStock,
    refreshSingleJig
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
  try {
    setLoading(true);
    setMessage("");

    const uniqueJigIds = [...new Set(selectedItems.map((item) => item.jigId))];
    
    const freshJigs = await Promise.all(uniqueJigIds.map((id) => refreshSingleJig(id)));

    const itemsWithIssues = selectedItems.filter((item) => {
      const latestJig = freshJigs.find(fj => fj._id === item.jigId);
      if (!latestJig) return true;

      const colorData = latestJig.colors.find(c => c.color === item.colorId);
      const available = colorData ? colorData.stock : 0;
      
      return item.quantity > available;
    });

    if (itemsWithIssues.length > 0) {
      setMessage("Stock levels just changed. Please review your selection.");
      setLoading(false);
      return; 
    }

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

    const res = await api.post("/order", orderData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (selectedItems.length === Object.values(cartItems).length) {
      clearCart();
    } else {
      removePurchasedItems(items);
    }
    setMessage("Order placed successfully!");

  } catch (err) {
    const errorData = err.response?.data;
    if (errorData?.code === "OUT_OF_STOCK") {
      setMessage(errorData.message);
      await refreshJigs(); 
    } else {
      setMessage(errorData?.message || "Error placing order");
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