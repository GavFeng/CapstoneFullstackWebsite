import React, { useState } from "react";
import ManageAttributes from "../../Components/ManageAttributes/ManageAttributes";
import ManageTimeSlots from "../../Components/ManageTimeSlots/ManageTimeSlots";
import api from "../../Services/api";
import "./PickupManager.css";

const PickupManager = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="pickup-manager-container">
      <h2>Pickup & Scheduling Management</h2>
      
      <div className="pickup-grid">
        <section className="location-section">
          <ManageAttributes 
            title="Pickup Locations"
            itemName="Location"
            // Use relative paths now
            endpoint="locations" 
            checkEndpoint="locations/check-name"
            fields={[
              { name: "name", placeholder: "Location Name (ex: Pike Place)" },
              { name: "address", placeholder: "Address (ex: 85 Pike St)" },
              { name: "city", placeholder: "City (ex: Seattle)" },
            ]}
            onSelect={(loc) => setSelectedLocation(loc)} 
            selectedId={selectedLocation?._id}
          />
        </section>

        <section className="slots-section">
          {selectedLocation ? (
            <ManageTimeSlots 
              location={selectedLocation} 
              endpoint="timeslots" // Relative path
            />
          ) : (
            <div className="select-prompt">
              <h3>No Location Selected</h3>
              <p>Please select a location like <strong>Pike Place</strong> from the list to manage its pickup schedule.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PickupManager;