// src/components/PriceChart.js
import React from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

function PriceChart({ data }) {
  const labels = data.map((entry) => entry.Date);
  const prices = data.map((entry) => entry.Price.replace(/[^0-9]+/g, ""));

  console.log(prices);

  // In your component or a separate configuration file
  Chart.defaults.plugins.tooltip.callbacks.title = (tooltipItem) => {
    // Customize tooltip title format here
    return tooltipItem[0].label; // Assuming labels are in date format
  };

  Chart.defaults.plugins.tooltip.callbacks.label = (tooltipItem) => {
    // Customize tooltip label format here
    return `Value: ${tooltipItem.parsed.y}`;
  };

  // Other Chart.js configuration options

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
        type: "time",
        time: {
          unit: "day", // Specify the time unit you want to display (e.g., day, month)
          tooltipFormat: "yyyy-mm-dd", // Specify the tooltip date format
          displayFormats: {
            day: "yyyy-mm-dd", // Specify the display date format
          },
        },
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        type: "linear",
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
