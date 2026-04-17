import React, { useState, useEffect } from "react";
import api from "../../Services/api";
import "./ManageTimeSlots.css";

const ManageTimeSlots = ({ location, endpoint }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Recurring Form State
  const [recurData, setRecurData] = useState({
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "10:00",
    days: [], // [1, 3, 5] for Mon, Wed, Fri
    capacity: 5
  });

  const weekDays = [
    { label: "S", value: 0 }, { label: "M", value: 1 }, { label: "T", value: 2 },
    { label: "W", value: 3 }, { label: "T", value: 4 }, { label: "F", value: 5 }, { label: "S", value: 6 }
  ];

  const fetchSlots = async () => {
    try {
      const res = await api.get(`${endpoint}?locationId=${location._id}`);
      setSlots(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSlots(); }, [location]);

  const toggleDay = (day) => {
    setRecurData(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
    }));
  };

  const handleCreateSlots = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Best Recurring Logic: Generate dates between Start and End
    const generatedSlots = [];
    let current = new Date(recurData.startDate + "T00:00:00");
    const end = new Date(recurData.endDate + "T23:59:59");

    while (current <= end) {
      if (recurData.days.includes(current.getDay())) {
        const startTimestamp = `${current.toISOString().split('T')[0]}T${recurData.startTime}:00`;
        const endTimestamp = `${current.toISOString().split('T')[0]}T${recurData.endTime}:00`;
        
        generatedSlots.push({
          startTime: startTimestamp,
          endTime: endTimestamp,
          capacity: recurData.capacity
        });
      }
      current.setDate(current.getDate() + 1);
    }

    try {
      await api.post(endpoint, {
        location: location._id,
        slots: generatedSlots
      });
      alert(`Created ${generatedSlots.length} slots!`);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || "Overlap detected");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slots-manager-card">
      <h3>Manage Slots for {location.name}</h3>
      
      <form className="recurring-form" onSubmit={handleCreateSlots}>
        <div className="form-row">
          <input type="date" required value={recurData.startDate} onChange={e => setRecurData({...recurData, startDate: e.target.value})} />
          <span>to</span>
          <input type="date" required value={recurData.endDate} onChange={e => setRecurData({...recurData, endDate: e.target.value})} />
        </div>

        <div className="form-row">
          <input type="time" required value={recurData.startTime} onChange={e => setRecurData({...recurData, startTime: e.target.value})} />
          <input type="time" required value={recurData.endTime} onChange={e => setRecurData({...recurData, endTime: e.target.value})} />
          <input type="number" placeholder="Cap" value={recurData.capacity} onChange={e => setRecurData({...recurData, capacity: e.target.value})} />
        </div>

        <div className="days-picker">
          {weekDays.map(day => (
            <button 
              key={day.value} 
              type="button"
              className={recurData.days.includes(day.value) ? "active" : ""}
              onClick={() => toggleDay(day.value)}
            >
              {day.label}
            </button>
          ))}
        </div>

        <button className="btn-generate" disabled={loading || recurData.days.length === 0}>
          {loading ? "Generating..." : "Generate Recurring Slots"}
        </button>
      </form>

      <div className="slots-list">
        {slots.map(slot => (
          <div key={slot._id} className="slot-item">
            <span>{new Date(slot.startTime).toLocaleDateString()}</span>
            <span>{new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            <span className="cap-pill">{slot.currentBookings} / {slot.capacity}</span>
            <button onClick={() => api.delete(`${endpoint}/${slot._id}`).then(fetchSlots)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageTimeSlots