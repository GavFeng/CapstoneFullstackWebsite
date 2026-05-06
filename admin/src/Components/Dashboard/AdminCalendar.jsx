import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


// Calendar Component for Admin Dashboard
const AdminCalendar = ({ orders, selectedDate, onDateChange }) => {
  
  // Filter out cancelled orders for calendar
  const validOrders = orders.filter(o => o.status !== 'cancelled');

  // Matchs Orders to calendar dates
  const getOrdersForDate = (date) => {
    return validOrders.filter(order => {
      const orderDate = new Date(order.pickupDetails?.timeSlot?.startTime || order.createdAt);
      return orderDate.toDateString() === date.toDateString();
    });
  };

  // Renderer for individual calendar tiles
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dayOrders = getOrdersForDate(date);
    
    return (
      <div className="calendar-tile-content">
        <div className="order-list-mini">
          {dayOrders.slice(0, 4).map(order => (
            <div key={order._id} className={`mini-order-item ${order.status}`}>
              <span className="mini-dot"></span>
              <span className="mini-text">
                #{order._id.slice(-4).toUpperCase()} {order.user?.name || 'Guest'}
              </span>
            </div>
          ))}
          {dayOrders.length > 4 && (
            <div className="more-orders-text">+{dayOrders.length - 4} more</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-main-view full-width-layout">
      <Calendar 
        onChange={onDateChange} 
        value={selectedDate}
        tileContent={tileContent}
        className="large-admin-calendar"
      />
      <div className="calendar-legend">
        <div className="legend-item"><span className="dot dot-pending"></span> Pending</div>
        <div className="legend-item"><span className="dot dot-ready"></span> Ready</div>
        <div className="legend-item"><span className="dot dot-completed"></span> Done</div>
      </div>
    </div>
  );
};

export default AdminCalendar;