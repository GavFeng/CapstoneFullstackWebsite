import React, { useEffect, useState } from 'react';
import api from '../../Services/api';
import AdminCalendar from './AdminCalendar';
import './Dashboard.css';

const Dashboard = () => {

  /* ---------- STATE ---------- */
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('active');
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  /* ---------- FETCH + EFFECT ---------- */
  const fetchAllOrders = async () => {
    try {
      const { data } = await api.get("/order/all-orders");
      const sortedData = data.sort((a, b) => {
        const dateA = a.pickupDetails?.timeSlot?.startTime ? new Date(a.pickupDetails.timeSlot.startTime) : new Date(a.createdAt);
        const dateB = b.pickupDetails?.timeSlot?.startTime ? new Date(b.pickupDetails.timeSlot.startTime) : new Date(b.createdAt);
        return dateA - dateB;
      });
      setOrders(sortedData);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllOrders(); }, []);

  /* ---------- FILTERS ---------- */

  const activeOrders = orders.filter(o => o.status === 'pending');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => ['completed', 'delivered', 'shipped'].includes(o.status));
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  
  /* ---------- HELPERS ---------- */

  const getFilteredOrders = () => {
    if (showCalendar) {
      return orders.filter(o => 
        o.status !== 'cancelled' &&
        new Date(o.pickupDetails?.timeSlot?.startTime || o.createdAt).toDateString() === selectedDate.toDateString()
      );
    }
    switch (view) {
      case 'ready': return readyOrders;
      case 'completed': return completedOrders;
      case 'cancelled': return cancelledOrders;
      default: return activeOrders;
    }
  };

  const getStatusTimeline = (order) => {
    const startTime = order.pickupDetails?.timeSlot?.startTime;
    const formatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const pickupDateStr = startTime ? new Date(startTime).toLocaleString([], formatOptions) : order.pickupDetails?.timeSlotSnapshot;

    switch (order.status) {
      case 'pending':
        let finishByStr = pickupDateStr;
        if (startTime) {
          const finishByDate = new Date(startTime);
          finishByDate.setHours(finishByDate.getHours() - 2);
          finishByStr = finishByDate.toLocaleString([], formatOptions);
        }
        return { label: 'Finish By:', value: finishByStr, class: 'status-deadline' };
      case 'ready': return { label: 'Pickup At:', value: pickupDateStr, class: 'status-ready' };
      case 'completed': return { label: 'Fulfilled:', value: new Date(order.updatedAt).toLocaleString(), class: 'status-fulfilled' };
      case 'cancelled': return { label: 'Cancelled:', value: new Date(order.updatedAt).toLocaleString(), class: 'status-cancelled' };
      default: return { label: 'Order Date:', value: pickupDateStr, class: '' };
    }
  };

  /* ---------- HANDLERS ---------- */

  const handleStatusUpdate = async () => {
    if (!confirmAction) return;
    try {
      await api.put(`/order/${confirmAction.orderId}/status`, { status: confirmAction.newStatus });
      setConfirmAction(null);
      await fetchAllOrders();
    } catch (err) { console.error(err); }
  };


  /* ----------  JSX ----------  */
  if (loading) return <div className="admin-status">Loading Admin Dashboard...</div>;

  return (
    <div className="admin-orders-container">
      <header className="admin-header">
        <div className="title-group">
          <h1>Admin Orders</h1>
          <button className="toggle-view-btn" onClick={() => setShowCalendar(!showCalendar)}>
            {showCalendar ? "📋 Switch to List" : "🗓️ Switch to Calendar"}
          </button>
        </div>
        
        {!showCalendar && (
          <div className="admin-tabs">
            <button className={view === 'active' ? 'active' : ''} onClick={() => setView('active')}>To Do ({activeOrders.length})</button>
            <button className={view === 'ready' ? 'active' : ''} onClick={() => setView('ready')}>Ready ({readyOrders.length})</button>
            <button className={view === 'completed' ? 'active' : ''} onClick={() => setView('completed')}>History ({completedOrders.length})</button>
            <button className={view === 'cancelled' ? 'active' : ''} onClick={() => setView('cancelled')}>Cancelled ({cancelledOrders.length})</button>
          </div>
        )}
      </header>

      <div className={showCalendar ? "calendar-dashboard-layout" : "admin-orders-list"}>
        {showCalendar && (
          <AdminCalendar 
            orders={orders} 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate} 
          />
        )}

        <div className={showCalendar ? "calendar-side-panel side-panel-scroll" : ""}>
          {showCalendar && <h3 className="panel-date-title">{selectedDate.toDateString()}</h3>}
          {getFilteredOrders().length === 0 ? (
            <div className="empty-state">No orders found.</div>
          ) : (
            getFilteredOrders().map(order => {
              const timeline = getStatusTimeline(order);
              return (
                <div key={order._id} className={`admin-order-card ${order.status}`}>
                  <div className="card-header-dashboard">
                    <div className="order-id-group">
                      <h3>#{order._id.slice(-6).toUpperCase()}</h3>
                      <span className={`badge ${order.status}`}>{order.status}</span>
                    </div>
                    <div className={`timeline-info ${timeline.class}`}>
                      <span className="timeline-label">{timeline.label}</span> {timeline.value}
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
                      {order.user?.phone && <p className="subtext phone-text">📞 {order.user.phone}</p>}
                    </div>

                    <div className="items-box">
                      <strong>Items</strong>
                      {order.items?.map((item, i) => (
                        <div key={i} className="admin-item-line">
                          {item.quantity}x {item.jig?.name} 
                          <span className="admin-color-tag" style={{ color: item.color?.name || "#666", fontWeight: 'bold' }}>
                            ({item.color?.name || "Standard"})
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="delivery-box">
                      <strong>{order.deliveryMethod === 'shipping' ? '🚚 Shipping' : '🏠 Pickup'}</strong>
                      <div className="subtext">
                        {order.deliveryMethod === 'shipping' ? (
                          <>
                            <p>{order.shippingAddress?.street}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                          </>
                        ) : (
                          <>
                            <p><strong>{order.pickupDetails?.locationNameSnapshot}</strong></p>
                            <p>{order.pickupDetails?.addressSnapshot}</p>
                            <p>{order.pickupDetails?.citySnapshot}, {order.pickupDetails?.stateSnapshot} {order.pickupDetails?.zipSnapshot}</p>
                            {order.pickupDetails?.pickupCode && <p className="admin-pickup-code">Code: {order.pickupDetails.pickupCode}</p>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="admin-actions">
                    {order.status === 'pending' && (
                      <button className="btn-ready" onClick={() => setConfirmAction({orderId: order._id, newStatus: 'ready'})}>Mark Ready</button>
                    )}
                    {order.status === 'ready' && (
                      <button className="btn-complete" onClick={() => setConfirmAction({orderId: order._id, newStatus: 'completed'})}>Finalize</button>
                    )}
                    {['pending', 'ready'].includes(order.status) && (
                      <button className="btn-cancel" onClick={() => setConfirmAction({orderId: order._id, newStatus: 'cancelled'})}>Cancel</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {confirmAction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Action</h3>
            <p>Move to <strong>{confirmAction.newStatus.toUpperCase()}</strong>?</p>
            {confirmAction.newStatus === 'completed' && <p className="modal-warning">Marking as completed will also mark payment as PAID.</p>}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className="btn-confirm" onClick={handleStatusUpdate}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;