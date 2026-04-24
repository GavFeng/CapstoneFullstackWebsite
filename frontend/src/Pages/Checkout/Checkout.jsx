import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { JigContext } from "../../Context/JigContext";
import { useAuth } from "../../Context/AuthContext";
import { useTranslation } from "react-i18next";
import api from "../../Services/Api";
import "./Checkout.css";

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'ko' ? 'ko-KR' : i18n.language === 'zh' ? 'zh-CN' : 'en-US';
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

  const navigate = useNavigate();


  
  const { token } = useAuth();

  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");

  // Sync selected items with cart
  useEffect(() => {
    setSelectedItems(Object.values(cartItems));
  }, [cartItems]);
  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data } = await api.get("/locations");
        setLocations(data);
      } catch (err) {
        console.error("Error fetching locations", err);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocationId) {
      const fetchSlots = async () => {
        try {
          const { data } = await api.get(`/timeSlots?locationId=${selectedLocationId}`);
          console.log("Fetched Slots for location:", selectedLocationId, data);
          setAvailableSlots(data);
        } catch (err) {
          console.error("Error fetching slots", err);
        }
      };
      fetchSlots();
    }
  }, [selectedLocationId]);

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

  const selectedLocationData = useMemo(() => {
    return locations.find(loc => loc._id === selectedLocationId);
  }, [selectedLocationId, locations]);

  const selectedSlotData = useMemo(() => {
    return availableSlots.find(slot => slot._id === selectedSlotId);
  }, [selectedSlotId, availableSlots]);
  const freshOutOfStock = selectedItems.filter((item) => {
    const available = getAvailableStock?.(item.jigId, item.colorId) ?? 0;
    return item.quantity > available;
  });

const handleSubmit = async () => {
  try {
    setLoading(true);
    setMessage("");

    const uniqueJigIds = [...new Set(selectedItems.map((item) => item.jigId))];
    
    const freshJigsFromServer = await Promise.all(
      uniqueJigIds.map((id) => refreshSingleJig(id))
    );

    const itemsWithIssues = selectedItems.filter((selectedItem) => {
      const freshJig = freshJigsFromServer.find(fj => String(fj?._id) === String(selectedItem.jigId));
    
      if (!freshJig) return true;

      const colorData = freshJig.colors.find(c => {
        const colorIdFromServer = c.color?._id; 
        return String(colorIdFromServer) === String(selectedItem.colorId);
      });

      if (!colorData) {
        return true; 
      }
      const available = Number(colorData.stock || 0);
      const requested = Number(selectedItem.quantity);

      return requested > available;
    });

    if (itemsWithIssues.length > 0) {
      setMessage(t('checkout.stockChangeError'));
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
        location: selectedLocationId, 
        timeSlot: selectedSlotId 
      },
    };

    const res = await api.post("/order", orderData);

    if (selectedItems.length === Object.values(cartItems).length) {
      clearCart();
    } else {
      removePurchasedItems(items);
    }

    setMessage(t('checkout.successMessage'));
    setTimeout(() => {
      navigate("/profile/my-orders");
    }, 2000);
  } catch (err) {
    const errorData = err.response?.data;
    if (errorData?.code === "OUT_OF_STOCK") {
      setMessage(t('checkout.outOfStockError'));
      await refreshJigs(); 
    } else {
      setMessage(errorData?.message || t('checkout.generalError'));
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-container">
        <h1>{t('checkout.title')}</h1>

        {outOfStockWarnings.length > 0 && (
          <div className="stock-error">
            ⚠️ {t('checkout.stockError')}
          </div>
        )}

        <div className="checkout-section">
          <label>{t('checkout.pickupLocation')}</label>
          <select value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)}>
            <option value="">{t('checkout.selectLocation')}</option>
            {locations.map(loc => (
              <option key={loc._id} value={loc._id}>{loc.name}</option>
            ))}
          </select>
          {selectedLocationData && (
            <div className="location-info-card">
              <div className="info-header">
                <span className="icon">📍</span>
                <strong>{selectedLocationData.name}</strong>
              </div>
              <div className="info-body">
                <p>{selectedLocationData.address}</p>
                <p>{selectedLocationData.city}, {selectedLocationData.state} {selectedLocationData.zip}</p>
                {selectedLocationData.phone && (
                  <p className="phone-info">📞 {selectedLocationData.phone}</p>
                )}
              </div>
            </div>
          )}
        </div>

      {/* TIME SLOT SELECTION */}
      <div className="checkout-section">
        <label className="section-label">{t('checkout.pickupTimeLabel')}</label>
        <select
          className="slot-select"
          value={selectedSlotId}
          onChange={(e) => setSelectedSlotId(e.target.value)}
          disabled={!selectedLocationId}
        >
          <option value="">{selectedLocationId ? t('checkout.selectTimeWindow') : t('checkout.selectLocationFirst')}</option>
          {availableSlots.map(slot => (
            <option key={slot._id} value={slot._id}>
              {new Date(slot.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} | {new Date(slot.startTime).getHours()}:00 - {new Date(slot.endTime).getHours()}:00
            </option>
          ))}
        </select>

        {selectedSlotData && (
          <div className="time-info-card">
            <div className="info-header">
              <span className="icon">⏰</span>
              <strong>{t('checkout.scheduledPickup')}</strong>
            </div>
            <div className="info-body">
              <p className="highlight-text">
                {new Date(selectedSlotData.startTime).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p>
                {t('checkout.betweenTime', {
                    start: new Date(selectedSlotData.startTime).toLocaleTimeString(currentLocale, { hour: '2-digit', minute: '2-digit' }),
                    end: new Date(selectedSlotData.endTime).toLocaleTimeString(currentLocale, { hour: '2-digit', minute: '2-digit' })
                  })}
              </p>
              <p className="timezone-text">
                {t('checkout.timezone')}: {Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}
      </div>

        <div className="checkout-items">
          <h2>{t('checkout.selectItems')}</h2>
            {Object.values(cartItems).map((entry) => {
              const jig = jigs.find(j => j._id === entry.jigId);
              if (!jig) return null;

              const colorMatch = jig.colors?.find(c => 
                String(c.color?._id ) === String(entry.colorId)
              );

              const displayColorName = colorMatch?.color?.name;

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
                  
                  {/* 2. UPDATE DISPLAY HERE */}
                  <span className="jig-name">{jig.name}</span>
                  <span 
                    className="color-tag" 
                    style={{ color: displayColorName || "#666" }}
                  >
                    {displayColorName}
                  </span>

                  <span className="item-price">
                    x {entry.quantity} (${(jig.price * entry.quantity).toFixed(2)})
                    {isOutOfStock && <span className="oos-label"> ({t('product.outOfStock')})</span>}
                  </span>
                </div>
              );
            })}
        </div>

        <div className="checkout-summary">
          <h2>{t('checkout.orderSummary')}</h2>
          <p className="total-amount">{t('cart.total')}: ${selectedTotal.toFixed(2)}</p>
        </div>

        <button
          className="place-order-btn"
          onClick={handleSubmit}
          disabled={loading || outOfStockWarnings.length > 0}
        >
          {loading ? t('checkout.placingOrder') : t('checkout.placeOrder')}
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

export default Checkout