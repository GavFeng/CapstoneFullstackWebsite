import React, { useState, useEffect } from "react";
import ManageAttributes from "../../Components/ManageAttributes/ManageAttributes";
import ManageTimeSlots from "../../Components/ManageTimeSlots/ManageTimeSlots";
import api from "../../Services/api";
import "./PickupManager.css";

const PickupManager = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [upcomingSlots, setUpcomingSlots] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchSummary = async () => {
    try {
      const res = await api.get("timeSlots/all-upcoming"); 
      setUpcomingSlots(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [refreshKey]);

  const handleLocationDeleted = (deletedId) => {
    if (selectedLocation?._id === deletedId) {
      setSelectedLocation(null);
    }
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="pickup-manager-container">
      <h2>Pickup & Scheduling Management</h2>

      <section className="upcoming-summary-card">
        <div className="summary-header">
          <h3>Next Scheduled Pickups</h3>
          <button className="btn-refresh" onClick={() => setRefreshKey(k => k + 1)}>↻</button>
        </div>
        <div className="summary-grid">
          {upcomingSlots.length > 0 ? (
            upcomingSlots.slice(0, 4).map((slot) => (
              <div key={slot._id} className="summary-item">
                <div className="summary-date">
                  <span className="day">{new Date(slot.startTime).toLocaleDateString([], { weekday: 'short' })}</span>
                  <span className="date">{new Date(slot.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="summary-details">
                  <strong>{slot.location?.name || "Unknown Location"}</strong>
                  <span>{new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`summary-status ${slot.currentBookings >= slot.capacity ? 'full' : ''}`}>
                  {slot.currentBookings}/{slot.capacity}
                </div>
              </div>
            ))
          ) : (
            <p className="no-data-msg">No upcoming slots scheduled.</p>
          )}
        </div>
      </section>

      <div className="pickup-grid">
        <section className="location-section">
          <ManageAttributes 
            title="Pickup Locations"
            itemName="Location"
            endpoint="locations" 
            checkEndpoint="locations/check-name"
            fields={[
                { name: "name", placeholder: "Location Name" },
                { name: "address", placeholder: "Street Address" },
                { name: "city", placeholder: "City" },
                { name: "state", placeholder: "State" },
                { name: "zip", placeholder: "Zip Code" },
                { name: "phone", placeholder: "Contact Phone" },
            ]}
            onSelect={(loc) => setSelectedLocation(loc)} 
            selectedId={selectedLocation?._id}
            onDelete={handleLocationDeleted}
          />
        </section>

        <section className="slots-section">
          {selectedLocation ? (
            <ManageTimeSlots 
              location={selectedLocation} 
              endpoint="timeSlots" 
              onUpdate={() => setRefreshKey(k => k + 1)}
            />
          ) : (
            <div className="select-prompt">
              <h3>No Location Selected</h3>
              <p>Please select a location from the list to manage its schedule.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PickupManager;