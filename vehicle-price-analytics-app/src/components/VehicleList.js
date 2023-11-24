// src/components/VehicleList.js
import React, { useEffect, useState } from "react";
import PriceChart from "./PriceChart";

function VehicleList() {
  const [vehicleData, setVehicleData] = useState([]);

  useEffect(() => {
    // Fetch and load the JSON data
    fetch("/vehicle_data.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setVehicleData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  console.log(vehicleData);

  return (
    <div>
      <h1>Vehicle Price Analytics</h1>
      {vehicleData.length > 0 ? (
        <>
          <PriceChart data={vehicleData} />
          <ul>
            {vehicleData.map((vehicle, index) => (
              <li key={index}>
                <h2>{vehicle.Title}</h2>
                <p>Price: {vehicle.Price}</p>
                <p>Date: {vehicle.Date}</p>
                {/* Add more fields as needed */}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}

export default VehicleList;
