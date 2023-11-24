import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import 'chartjs-adapter-date-fns';

function PriceChart({ data }) {
  const chartContainer = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = data.map((entry) => new Date(entry.Date));
    const prices = data.map((entry) => entry.Price);

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "Price Variation",
          data: prices.map((price, index) => ({ x: labels[index], y: price })),
          pointBackgroundColor: "rgb(75, 192, 192)",
        },
        {
          label: "Median",
          data: calculateMedianForEachDate(labels, prices),
          type: 'line',
          borderColor: 'rgb(255, 0, 0)', // Change color as needed
          fill: false,
        },
      ],
    };

    const chartOptions = {
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
            tooltipFormat: "yyyy-mm-dd",
            displayFormats: {
              day: "yyyy-mm-dd",
            },
          },
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

    const ctx = chartContainer.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: 'scatter',
      data: chartData,
      options: chartOptions,
    });

    // Cleanup: destroy chart on component unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  // Function to calculate median for each date
  const calculateMedianForEachDate = (dates, prices) => {
    const uniqueDates = [...new Set(dates)];
    const medianDataPoints = [];

    uniqueDates.forEach((date) => {
      const pricesForDate = prices.filter((price, index) => dates[index].getTime() === date.getTime());
      const median = calculateMedian(pricesForDate);
      medianDataPoints.push({ x: date, y: median });
    });

    return medianDataPoints;
  };

  // Function to calculate the median
  const calculateMedian = (arr) => {
    const sortedArr = arr.slice().sort((a, b) => a - b);
    const middle = Math.floor(sortedArr.length / 2);

    if (sortedArr.length % 2 === 0) {
      return (sortedArr[middle - 1] + sortedArr[middle]) / 2;
    } else {
      return sortedArr[middle];
    }
  };

  return (
    <div>
      <h2>Price Variation Over Time</h2>
      <canvas ref={chartContainer} />
    </div>
  );
}

export default PriceChart;
