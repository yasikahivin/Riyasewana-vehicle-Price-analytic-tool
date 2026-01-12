import React, { useEffect, useMemo, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

const formatLKR = (value) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(value);

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function PriceChart({ data, dateField = 'Date' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const prepared = useMemo(() => {
    const rows = Array.isArray(data)
      ? data
          .map((d) => ({
            dateKey:
              typeof d[dateField] === 'string'
                ? d[dateField].slice(0, 10)
                : null,
            price:
              typeof d.Price === 'number'
                ? d.Price
                : Number(String(d.Price || '').replace(/,/g, '')) || null,
          }))
          .filter(
            (r) =>
              r.dateKey && typeof r.price === 'number' && !Number.isNaN(r.price)
          )
      : [];

    const days = Array.from(new Set(rows.map((r) => r.dateKey))).sort();

    if (days.length >= 2) {
      rows.sort((a, b) => a.dateKey.localeCompare(b.dateKey));

      const points = rows.map((r) => ({
        x: new Date(`${r.dateKey}T00:00:00`),
        y: r.price,
      }));

      const byDay = new Map();
      for (const r of rows) {
        if (!byDay.has(r.dateKey)) byDay.set(r.dateKey, []);
        byDay.get(r.dateKey).push(r.price);
      }

      const dailyMedian = Array.from(byDay.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([day, prices]) => {
          const sorted = [...prices].sort((x, y) => x - y);
          const mid = Math.floor(sorted.length / 2);
          const median =
            sorted.length % 2 === 0
              ? (sorted[mid - 1] + sorted[mid]) / 2
              : sorted[mid];
          return { x: new Date(`${day}T00:00:00`), y: Math.round(median) };
        });

      const first = new Date(`${days[0]}T00:00:00`);
      const last = new Date(`${days[days.length - 1]}T00:00:00`);

      return {
        mode: 'time',
        points,
        dailyMedian,
        xMin: addDays(first, -1),
        xMax: addDays(last, +1),
      };
    }

    // Histogram mode
    const prices = rows.map((r) => r.price).sort((a, b) => a - b);
    if (!prices.length) return { mode: 'empty' };

    const BIN = 250_000;
    const min = Math.floor(prices[0] / BIN) * BIN;
    const max = Math.ceil(prices[prices.length - 1] / BIN) * BIN;

    const bins = [];
    for (let start = min; start < max; start += BIN) {
      bins.push({ start, count: 0 });
    }
    for (const p of prices) {
      const idx = Math.min(bins.length - 1, Math.floor((p - min) / BIN));
      if (bins[idx]) bins[idx].count += 1;
    }

    return {
      mode: 'hist',
      labels: bins.map(
        (b) => `${Math.round((b.start / 1_000_000) * 10) / 10}M`
      ),
      counts: bins.map((b) => b.count),
      note:
        days.length === 1
          ? `Only one ${dateField} day in current data — showing price distribution.`
          : 'Not enough date data — showing price distribution.',
    };
  }, [data, dateField]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    if (prepared.mode === 'empty') return;

    const ctx = canvasRef.current.getContext('2d');

    if (prepared.mode === 'time') {
      chartRef.current = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            { label: 'Listings', data: prepared.points, pointRadius: 3 },
            {
              label: 'Daily median',
              type: 'line',
              data: prepared.dailyMedian,
              tension: 0.25,
              pointRadius: 2,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          parsing: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `${ctx.dataset.label}: ${formatLKR(ctx.parsed.y)}`,
              },
            },
            legend: { position: 'top' },
          },
          scales: {
            x: {
              type: 'time',
              min: prepared.xMin,
              max: prepared.xMax,
              time: {
                unit: 'day',
                tooltipFormat: 'yyyy-MM-dd',
                displayFormats: { day: 'yyyy-MM-dd' },
              },
              title: { display: true, text: `${dateField}` },
            },
            y: {
              title: { display: true, text: 'Price (LKR)' },
            },
          },
        },
      });
      return;
    }

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: prepared.labels,
        datasets: [{ label: 'Number of listings', data: prepared.counts }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `Listings: ${ctx.parsed.y}`,
            },
          },
          legend: { position: 'top' },
        },
        scales: {
          x: {
            title: { display: true, text: 'Price bins (approx, millions LKR)' },
          },
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [prepared, dateField]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Price Variation</h2>
        <small style={{ opacity: 0.75 }}>
          {prepared.mode === 'time'
            ? `Trend by ${dateField}`
            : prepared.mode === 'hist'
            ? prepared.note
            : ''}
        </small>
      </div>
      <div style={{ height: 360, marginTop: 12 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default PriceChart;
