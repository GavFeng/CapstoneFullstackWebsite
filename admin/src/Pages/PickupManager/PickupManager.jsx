import React, { useState } from "react";
import ManageAttributes from "../../Components/ManageAttributes/ManageAttributes";
import ManageTimeSlots from "../../Components/ManageTimeSlots/ManageTimeSlots";
import "./PickupManager.css";

const PickupManager = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationDeleted = (deletedId) => {
  if (selectedLocation?._id === deletedId) {
    setSelectedLocation(null);
  }
};

  return (
    <div className="pickup-manager-container">
      <h2>Pickup & Scheduling Management</h2>
      
      <div className="pickup-grid">
        <section className="location-section">
          <ManageAttributes 
            title="Pickup Locations"
            itemName="Location"
            endpoint="locations" 
            checkEndpoint="locations/check-name"
            fields={[
                { name: "name", placeholder: "Location Name (ex: Pike Place)" },
                { name: "address", placeholder: "Street Address (ex: 85 Pike St)" },
                { name: "city", placeholder: "City (ex: Seattle)" },
                { name: "state", placeholder: "State (ex: WA)" },
                { name: "zip", placeholder: "Zip Code (ex: 98101)" },
                { name: "phone", placeholder: "Contact Phone (ex: 206-555-0123)" },
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