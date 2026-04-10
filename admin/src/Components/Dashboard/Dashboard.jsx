import React, { useEffect, useState } from 'react';
import api from '../../Services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('active'); // active, ready, or completed

  const fetchAllOrders = async () => {
    try {
      const { data } = await api.get("/order/all-orders");
      setOrders(data);
    } catch (err) {
      console.error("Error fetching admin orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/order/${orderId}/status`, { status: newStatus });
      fetchAllOrders();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // --- REVISED FILTER LOGIC ---
  const activeOrders = orders.filter(o => o.status === 'pending');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => ['completed', 'cancelled', 'delivered'].includes(o.status));

  // Determine which list to show based on the 'view' state
  const getFilteredOrders = () => {
    switch (view) {
      case 'ready': return readyOrders;
      case 'completed': return completedOrders;
      default: return activeOrders;
    }
  };

  if (loading) return <div className="admin-status">Loading Admin Dashboard...</div>;

  return (
    <div className="admin-orders-container">
      <header className="admin-header">
        <div className="title-group">
          <h1>Admin Orders</h1>
          <p>Manage fulfillment and history</p>
        </div>
        
        <div className="admin-tabs">
          <button 
            className={view === 'active' ? 'active' : ''} 
            onClick={() => setView('active')}
          >
            To Do ({activeOrders.length})
          </button>
          
          <button 
            className={view === 'ready' ? 'active' : ''} 
            onClick={() => setView('ready')}
          >
            Ready ({readyOrders.length})
          </button>
          
          <button 
            className={view === 'completed' ? 'active' : ''} 
            onClick={() => setView('completed')}
          >
            History ({completedOrders.length})
          </button>
        </div>
      </header>

      <div className="admin-orders-list">
        {getFilteredOrders().length === 0 ? (
          <div className="empty-state">No orders in this section.</div>
        ) : (
          getFilteredOrders().map(order => (
            <div key={order._id} className={`admin-order-card ${order.status}`}>
              <div className="card-header">
                <div className="order-id-group">
                  <h3>#{order._id.slice(-6).toUpperCase()}</h3>
                  <span className={`badge ${order.status}`}>{order.status}</span>
                </div>
                <div className="payment-status">
                   Payment: <span className={`badge ${order.paymentStatus}`}>{order.paymentStatus}</span>
                </div>
              </div>

              <div className="card-body">
                <div className="customer-box">
                  <strong>Customer</strong>
                  <p>{order.user?.name || 'Guest'}</p>
                  <p className="subtext">{order.user?.email}</p>
                  {order.user?.phone && (
                    <p className="subtext phone-text">📞 {order.user.phone}</p>
                  )}
                </div>

                <div className="items-box">
                  <strong>Items</strong>
                  {order.items?.map((item, i) => (
                    <div key={i} className="admin-item-line">
                      {item.quantity}x {item.jig?.name}{" "}
                      <span 
                        className="admin-color-tag"
                        style={{ 
                          color: item.color?.name || "#666", 
                          fontWeight: 'bold' 
                        }}
                      >
                        ({item.color?.name || "Standard"})
                      </span>
                    </div>
                  ))}
                </div>
                <div className="delivery-box">
                  <strong>{order.deliveryMethod === 'shipping' ? '🚚 Shipping' : '🏠 Pickup'}</strong>
                  {order.deliveryMethod === 'shipping' ? (
                    <p className="subtext">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                  ) : (
                    <p className="subtext">Location: {order.pickupDetails?.location}</p>
                  )}
                </div>
              </div>

              <div className="admin-actions">
                {/* Pending -> Ready */}
                {order.status === 'pending' && (
                  <button className="btn-ready" onClick={() => handleStatusUpdate(order._id, 'ready')}>
                    Mark as Ready
                  </button>
                )}
                
                {/* Ready -> Completed */}
                {order.status === 'ready' && (
                  <button className="btn-complete" onClick={() => handleStatusUpdate(order._id, 'completed')}>
                    Finalize Order
                  </button>
                )}
                
                {/* Cancel option for anything not already finalized */}
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <button className="btn-cancel" onClick={() => handleStatusUpdate(order._id, 'cancelled')}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;