import React, { useEffect, useState } from 'react';
import api from '../../Services/Api'; 
import { useAuth } from '../../Context/AuthContext'; 
import './MyOrders.css';

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (user) {
          const { data } = await api.get('/order/my-orders');
          setOrders(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) fetchOrders();
  }, [user, authLoading]);

  /* ---------- HELPERS ---------- */
  
  const getOrderItemData = (item) => {
    const jig = item.jig;
    const colorObj = item.color;
    
    // Find the variant using IDs (works with string or ObjectId comparison)
    const variant = jig?.colors?.find(v => 
      String(v.color?._id || v.color) === String(colorObj?._id || colorObj)
    );

    return {
      name: jig?.name || "Unknown Product",
      colorName: colorObj?.name || "Default",
      imageUrl: variant?.images?.[0]?.url,
      price: item.price || 0,
      quantity: item.quantity || 0
    };
  };

  const renderDeliveryInfo = (order) => {
    if (order.deliveryMethod === 'shipping' && order.shippingAddress) {
      const { name, street, city, state, zip } = order.shippingAddress;
      return (
        <div className="delivery-details">
          <p><strong>{name}</strong></p>
          <p>{street}</p>
          <p>{city}, {state} {zip}</p>
        </div>
      );
    }
    
    // Updated to use the Snapshots created in your controller
    if (order.deliveryMethod === 'pickup' && order.pickupDetails) {
        const { 
          locationNameSnapshot, 
          addressSnapshot, 
          citySnapshot, 
          stateSnapshot, 
          zipSnapshot, 
          phoneSnapshot, 
          timeSlotSnapshot, 
          pickupCode 
        } = order.pickupDetails;

        return (
          <div className="delivery-details">
            <p><strong>Pickup Location:</strong> {locationNameSnapshot}</p>
            <p>{addressSnapshot}</p>
            <p>{citySnapshot}, {stateSnapshot} {zipSnapshot}</p>
            <p><strong>Phone:</strong> {phoneSnapshot}</p>
            <hr className="mini-hr" />
            <p><strong>Pickup Time:</strong> {timeSlotSnapshot}</p>
            {pickupCode && (
              <p className="pickup-code"><strong>Code:</strong> {pickupCode}</p>
            )}
          </div>
        );
      }

    return <p>Delivery details unavailable</p>;
  };

  /* ---------- HANDLERS ---------- */
  const openOrderDetails = async (orderId) => {
    try {
      const { data } = await api.get(`/order/${orderId}`);
      setSelectedOrder(data);
    } catch (err) {
      alert("Failed to load order details");
    }
  };

  if (authLoading || loading) return <div className="status-message">Loading...</div>;

  return (
    <div className="orders-page-container">
      <h1>My Orders</h1>
      
      <div className="table-wrapper">
        {orders.length === 0 ? (
          <p className="no-orders">No orders found.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6).toUpperCase()}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>${order.totalAmount.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${order.paymentStatus || 'pending'}`}>
                      {order.paymentStatus || 'pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${order.status || 'pending'}`}>
                      {(order.status || 'pending').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => openOrderDetails(order._id)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL OVERLAY */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedOrder(null)}>&times;</button>
            
            <h2>Order Details</h2>
            <p className="order-meta">Full ID: {selectedOrder._id}</p>
            <hr />

            <div className="order-items-list">
              {selectedOrder.items.map((item, index) => {
                const { name, colorName, imageUrl, price, quantity } = getOrderItemData(item);
                return (
                  <div key={index} className="order-modal-item">
                    {imageUrl && <img src={imageUrl} alt={name} className="mini-img" />}
                    <div className="mini-info">
                      <p className="mini-name">{name}</p>
                      <div className="mini-color-row">
                        <span className="mini-color-name" style={{ color: colorName }}>
                          {colorName}
                        </span>
                      </div>
                      <div className="order-item-meta">
                        <p className="mini-price">${price.toFixed(2)} x {quantity}</p>
                        <p className="mini-total-price">Total: ${(price * quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-footer">
              <div className="shipping-info">
                <h4>Method: {selectedOrder.deliveryMethod.toUpperCase()}</h4>
                {renderDeliveryInfo(selectedOrder)}
              </div>
              <div className="total-section">
                <h3>Total Paid: ${selectedOrder.totalAmount.toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders