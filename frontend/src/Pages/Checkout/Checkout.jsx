import React, { useContext, useEffect, useState } from "react";
import { JigContext } from "../../Context/JigContext";
import { useAuth } from "../../Context/AuthContext";
import api from "../../Services/Api";
import "./Checkout.css";

const Checkout = () => {
  const { 
    cartItems, 
    cartTotal, 
    jigs, 
    clearCart,
    removePurchasedItems
   } = useContext(JigContext);
  
  const { token } = useAuth();

  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const cartArray = Object.values(cartItems);

  const [selectedItems, setSelectedItems] = useState(cartArray);


  useEffect(() => {
    setSelectedItems(Object.values(cartItems));
  }, [cartItems]);


  const toggleItem = (entry) => {
    setSelectedItems((prev) => {
      const exists = prev.find(
        (i) => i.jigId === entry.jigId && i.colorId === entry.colorId
      );

      if (exists) {
        return prev.filter(
          (i) =>
            !(i.jigId === entry.jigId && i.colorId === entry.colorId)
        );
      }

      return [...prev, entry];
    });
  };

  const selectedTotal = selectedItems.reduce((sum, entry) => {
    const jig = jigs.find((j) => j._id === entry.jigId);
    return jig ? sum + jig.price * entry.quantity : sum;
  }, 0);

  const handleSubmit = async () => {
    if (!location || !pickupDate) {
      return setMessage("Please select pickup location and date");
    }

    try {
      setLoading(true);

      if (selectedItems.length === 0) {
        setMessage("No items selected");
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
        pickupDetails: {
          location,
          pickupDate,
        },
      };

      await api.post("/order", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (selectedItems.length === cartArray.length) {
        // All items purchased
        clearCart();
      } else {
        // Partial checkout
        removePurchasedItems(items);
      }

      // navigate("/my-orders");

      setMessage("Order placed successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h1>Checkout (Pickup)</h1>

      {/* Pickup Location */}
      <div className="checkout-section">
        <label>Pickup Location</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">Select Location</option>
          <option value="Seattle Store">Seattle Store</option>
          <option value="Warehouse">Warehouse</option>
        </select>
      </div>

      {/* Pickup Date */}
      <div className="checkout-section">
        <label>Pickup Date & Time</label>
        <input
          type="datetime-local"
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
        />
      </div>

      <div className="checkout-items">
        <h2>Select Items</h2>

        {cartArray.map((entry) => {
          const jig = jigs.find(j => j._id === entry.jigId);
          if (!jig) return null;

          const isSelected = selectedItems.some(
            (i) =>
              i.jigId === entry.jigId &&
              i.colorId === entry.colorId
          );

          return (
            <div key={`${entry.jigId}-${entry.colorId}`} className="checkout-item">
              
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleItem(entry)}
              />

              <span>{jig.name}</span>

              <span>
                x{entry.quantity} (${(jig.price * entry.quantity).toFixed(2)})
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="checkout-summary">
        <h2>Order Summary</h2>
        <p>Total: ${selectedTotal.toFixed(2)}</p>
      </div>

      {/* Submit */}
      <button
        className="place-order-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>

      {message && <p className="checkout-message">{message}</p>}
    </div>
  );
}

export default Checkout