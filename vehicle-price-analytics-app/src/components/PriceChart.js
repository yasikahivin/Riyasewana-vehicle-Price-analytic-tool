// src/components/PriceChart.js
import React from "react";
import { Line } from "react-chartjs-2";

function PriceChart({ data }) {
  const labels = data.map((entry) => entry.Date);
  const prices = data.map((entry) => entry.Price);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Price Variation",
        data: prices,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price",
        },
      },
    },
  };

  return (
    <div>
      <h2>Price Variation Over Time</h2>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default PriceChart;
