// src/components/VehicleList.js
import React, { useEffect, useState } from "react";

function VehicleList() {
  const [vehicleData, setVehicleData] = useState([]);

  useEffect(() => {
    // Fetch and load the JSON data
    fetch("/vehicle_data.json")
      .then((response) => response.json())
      .then((data) => setVehicleData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h1>Vehicle Price Analytics</h1>
      <ul>
        {vehicleData.map((vehicle, index) => (
          <li key={index}>
            <h2>{vehicle.Title}</h2>
            <p>Price: {vehicle.Price}</p>
            <p>Location: {vehicle.Location}</p>
            {/* Add more fields as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VehicleList;
