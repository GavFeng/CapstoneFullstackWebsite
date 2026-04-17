import React, { useState, useEffect } from "react";
import api from "../../Services/api";
import "./ManageTimeSlots.css";

const ManageTimeSlots = ({ location, endpoint, onUpdate }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("individual");
  
  // Custom Popup/Modal State
  const [modal, setModal] = useState({ show: false, type: null, id: null, message: "" });
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  const [singleSlot, setSingleSlot] = useState({ date: "", startTime: "09:00", endTime: "10:00", capacity: 5 });
  const [recurData, setRecurData] = useState({ startDate: "", endDate: "", startTime: "09:00", endTime: "10:00", days: [], capacity: 5 });

  const weekDays = [
    { label: "S", value: 0 }, { label: "M", value: 1 }, { label: "T", value: 2 },
    { label: "W", value: 3 }, { label: "T", value: 4 }, { label: "F", value: 5 }, { label: "S", value: 6 }
  ];

  const today = new Date().toISOString().split("T")[0];

  const isTimeBefore = (start, end) => {
    return start < end;
  };

  const handleSingleDateChange = (e) => {
    setSingleSlot({ ...singleSlot, date: e.target.value });
  };

  const handleRecurDateChange = (field, value) => {
    setRecurData(prev => {
      let newData = { ...prev, [field]: value };
      
      if (field === 'startDate' && newData.endDate < value) {
        newData.endDate = value;
      }
      return newData;
    });
  };

  const handleTimeChange = (mode, field, value) => {
    const setter = mode === 'single' ? setSingleSlot : setRecurData;
    const data = mode === 'single' ? singleSlot : recurData;

    setter(prev => {
      let newData = { ...prev, [field]: value };

      if (field === 'startTime' && value >= prev.endTime) {
        const [hours, minutes] = value.split(':');
        const nextHour = (parseInt(hours) + 1).toString().padStart(2, '0');
        newData.endTime = `${nextHour}:${minutes}`;
      } 
      else if (field === 'endTime' && value <= prev.startTime) {
        return prev; // Ignore the change
      }

      return newData;
    });
  };

  const fetchSlots = async () => {
    try {
      const res = await api.get(`${endpoint}?locationId=${location._id}`);
      setSlots(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSlots(); }, [location]);

  // Auto-clear status messages
  useEffect(() => {
    if (statusMessage.text) {
      const timer = setTimeout(() => setStatusMessage({ text: "", type: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const toggleDay = (day) => {
    setRecurData(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
    }));
  };

  const handleCreateSlots = async (e) => {
    e.preventDefault();
    setLoading(true);
    let generatedSlots = [];

    if (activeTab === "individual") {
      generatedSlots.push({
        startTime: `${singleSlot.date}T${singleSlot.startTime}:00`,
        endTime: `${singleSlot.date}T${singleSlot.endTime}:00`,
        capacity: singleSlot.capacity
      });
    } else {
      let current = new Date(recurData.startDate + "T00:00:00");
      const end = new Date(recurData.endDate + "T23:59:59");
      while (current <= end) {
        if (recurData.days.includes(current.getDay())) {
          const dateStr = current.toISOString().split('T')[0];
          generatedSlots.push({
            startTime: `${dateStr}T${recurData.startTime}:00`,
            endTime: `${dateStr}T${recurData.endTime}:00`,
            capacity: recurData.capacity
          });
        }
        current.setDate(current.getDate() + 1);
      }
    }

    try {
      await api.post(endpoint, { location: location._id, slots: generatedSlots });
      if (onUpdate) onUpdate();
      setStatusMessage({ text: `Successfully created ${generatedSlots.length} slot(s)!`, type: "success" });
      fetchSlots();
    } catch (err) {
      setStatusMessage({ text: err.response?.data?.message || "Overlap detected", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    try {
      await api.delete(`${endpoint}/${modal.id}`);
      if (onUpdate) onUpdate();
      setStatusMessage({ text: "Slot deleted successfully", type: "success" });
      fetchSlots();
    } catch (err) {
      setStatusMessage({ text: "Failed to delete slot", type: "error" });
    }
    setModal({ show: false, type: null, id: null, message: "" });
  };

  return (
    <div className="slots-manager-card">
      <div className="card-header-time">
        <h3>Manage Slots: {location.name}</h3>
        <div className="tab-toggle">
          {["individual", "recurring"].map(tab => (
            <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Slot
            </button>
          ))}
        </div>
      </div>

      {statusMessage.text && (
        <div className={`status-banner ${statusMessage.type} fade-in`}>
          {statusMessage.type === 'success' ? '✅' : '⚠️'} {statusMessage.text}
        </div>
      )}
      
      <form className="slot-form" onSubmit={handleCreateSlots}>
        {activeTab === "individual" ? (
          <div className="form-section fade-in">
            <label>Pickup Date</label>
            <input 
              type="date" 
              required 
              min={today}
              value={singleSlot.date} 
              onChange={handleSingleDateChange} 
              onClick={(e) => e.target.showPicker()}
            />
            <div className="form-row-slot">
              <div className="input-half">
                <label>Start</label>
                <input 
                  type="time" 
                  required 
                  value={singleSlot.startTime} 
                  onChange={(e) => handleTimeChange('single', 'startTime', e.target.value)} 
                  onClick={(e) => e.target.showPicker()}
                />
              </div>
              <div className="input-half">
                <label>End</label>
                <input 
                  type="time" 
                  required 
                  min={singleSlot.startTime}
                  value={singleSlot.endTime} 
                  onChange={(e) => handleTimeChange('single', 'endTime', e.target.value)} 
                  onClick={(e) => e.target.showPicker()}
                />
              </div>
              <div className="input-half"><label>Order Cap</label><input type="number" value={singleSlot.capacity} onChange={e => setSingleSlot({...singleSlot, capacity: e.target.value})} /></div>
            </div>
          </div>
        ) : (
          <div className="form-section fade-in">
            <label>Date Range</label>
            <div className="form-row-slot">
              <input 
                type="date" 
                required 
                min={today} 
                value={recurData.startDate} 
                onChange={e => handleRecurDateChange('startDate', e.target.value)} 
                onClick={(e) => e.target.showPicker()}
              />
              <span className="connector">to</span>
              <input 
                type="date" 
                required 
                min={recurData.startDate || today} // Force second date ahead of first
                value={recurData.endDate} 
                onChange={e => handleRecurDateChange('endDate', e.target.value)} 
                onClick={(e) => e.target.showPicker()}
              />
            </div>
            <label>Time & Capacity</label>
            <div className="form-row-slot">
              <input 
                type="time" 
                required 
                value={recurData.startTime} 
                onChange={(e) => handleTimeChange('recur', 'startTime', e.target.value)} 
                onClick={(e) => e.target.showPicker()}
              />
              <input 
                type="time" 
                required 
                min={recurData.startTime} 
                value={recurData.endTime} 
                onChange={(e) => handleTimeChange('recur', 'endTime', e.target.value)} 
                onClick={(e) => e.target.showPicker()}
              />
              <input type="number" placeholder="Cap" value={recurData.capacity} onChange={e => setRecurData({...recurData, capacity: e.target.value})} />
            </div>
            <label>Repeat on Days</label>
            <div className="days-picker">
              {weekDays.map(day => (
                <button key={day.value} type="button" className={recurData.days.includes(day.value) ? "active" : ""} onClick={() => toggleDay(day.value)}>
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <button className="btn-generate" disabled={loading || (activeTab === 'recurring' && recurData.days.length === 0)}>
          {loading ? "Saving..." : activeTab === 'individual' ? "Add Single Slot" : "Generate Recurring Slots"}
        </button>
      </form>

      <div className="slots-list-container">
        <h4>Existing Slots</h4>
        <div className="slots-list">
          {slots.map(slot => (
            <div key={slot._id} className="slot-item">
              <div className="slot-date-info">
                <strong>{new Date(slot.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                <span>{new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(slot.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="slot-meta">
                <span className="cap-pill">{slot.currentBookings} / {slot.capacity}</span>
                <button className="btn-mini-delete" 
                  onClick={() => setModal({ show: true, id: slot._id, message: "Are you sure you want to delete this time slot?" })}>
                ×</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logic-Based Modal Overlay */}
      {modal.show && (
        <div className="modal-backdrop">
          <div className="modal-box fade-in">
            <div className="modal-header"><h3>Confirm Delete</h3></div>
            <div className="modal-body"><p>{modal.message}</p></div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setModal({ show: false, id: null, message: "" })}>Cancel</button>
              <button className="btn-delete-confirm" onClick={executeDelete}>Delete Slot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageTimeSlots;