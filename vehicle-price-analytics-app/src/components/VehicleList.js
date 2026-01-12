import React, { useEffect, useMemo, useState } from 'react';
import PriceChart from './PriceChart';
import './VehicleList.css';

const LKR = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  maximumFractionDigits: 0,
});

function toNumberPrice(p) {
  if (typeof p === 'number') return p;
  const n = Number(String(p || '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function toDateKey(s) {
  // expects YYYY-MM-DD or similar
  return typeof s === 'string' ? s.slice(0, 10) : '';
}

function VehicleList() {
  const [vehicleData, setVehicleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Advanced UI controls
  const [query, setQuery] = useState('');
  const [make, setMake] = useState('Any');
  const [city, setCity] = useState('Any');

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [dateFrom, setDateFrom] = useState(''); // posting date filter
  const [dateTo, setDateTo] = useState('');

  const [sortBy, setSortBy] = useState('date_desc'); // date_desc|date_asc|price_desc|price_asc|mileage_asc|mileage_desc
  const [chartDateField, setChartDateField] = useState('Date'); // Date | ScrapeDate

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const res = await fetch('/vehicle_data.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        if (!cancelled) setVehicleData(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const makes = useMemo(() => {
    const set = new Set();
    for (const v of vehicleData) {
      const t = String(v.Title || '').trim();
      const first = t.split(/\s+/)[0];
      if (first) set.add(first);
    }
    return ['Any', ...Array.from(set).sort()];
  }, [vehicleData]);

  const cities = useMemo(() => {
    const set = new Set();
    for (const v of vehicleData) {
      const c = String(v.Location || '').trim();
      if (c) set.add(c);
    }
    return ['Any', ...Array.from(set).sort()];
  }, [vehicleData]);

  const filtered = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    const min = minPrice === '' ? null : Number(minPrice);
    const max = maxPrice === '' ? null : Number(maxPrice);

    const fromKey = dateFrom ? dateFrom : null; // YYYY-MM-DD
    const toKey = dateTo ? dateTo : null;

    let rows = vehicleData
      .map((v) => ({
        ...v,
        Price: toNumberPrice(v.Price),
        DateKey: toDateKey(v.Date),
        ScrapeDateKey: toDateKey(v.ScrapeDate),
        MileageNum:
          typeof v.MileageKm === 'number'
            ? v.MileageKm
            : Number(String(v.MileageKm || '').replace(/,/g, '')) || null,
      }))
      .filter((v) => v.Price !== null && v.DateKey);

    // Make filter
    if (make !== 'Any') {
      rows = rows.filter((v) =>
        String(v.Title || '')
          .toLowerCase()
          .startsWith(make.toLowerCase() + ' ')
      );
    }

    // City filter
    if (city !== 'Any') {
      rows = rows.filter((v) => String(v.Location || '') === city);
    }

    // Advanced token search (AND)
    if (tokens.length) {
      rows = rows.filter((v) => {
        const t = String(v.Title || '').toLowerCase();
        return tokens.every((tok) => t.includes(tok));
      });
    }

    // Price range
    if (min !== null && Number.isFinite(min))
      rows = rows.filter((v) => v.Price >= min);
    if (max !== null && Number.isFinite(max))
      rows = rows.filter((v) => v.Price <= max);

    // Posting date range
    if (fromKey) rows = rows.filter((v) => v.DateKey >= fromKey);
    if (toKey) rows = rows.filter((v) => v.DateKey <= toKey);

    // Sorting
    rows.sort((a, b) => {
      if (sortBy === 'date_desc')
        return (
          b.DateKey.localeCompare(a.DateKey) || (b.Price ?? 0) - (a.Price ?? 0)
        );
      if (sortBy === 'date_asc')
        return (
          a.DateKey.localeCompare(b.DateKey) || (a.Price ?? 0) - (b.Price ?? 0)
        );
      if (sortBy === 'price_desc') return (b.Price ?? 0) - (a.Price ?? 0);
      if (sortBy === 'price_asc') return (a.Price ?? 0) - (b.Price ?? 0);
      if (sortBy === 'mileage_desc')
        return (b.MileageNum ?? -1) - (a.MileageNum ?? -1);
      if (sortBy === 'mileage_asc')
        return (a.MileageNum ?? 10 ** 18) - (b.MileageNum ?? 10 ** 18);
      return 0;
    });

    return rows;
  }, [
    vehicleData,
    query,
    make,
    city,
    minPrice,
    maxPrice,
    dateFrom,
    dateTo,
    sortBy,
  ]);

  const stats = useMemo(() => {
    const prices = filtered
      .map((v) => v.Price)
      .filter((p) => typeof p === 'number');
    if (!prices.length) return { count: 0, min: null, max: null, median: null };

    const sorted = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0
        ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
        : sorted[mid];

    return {
      count: prices.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median,
    };
  }, [filtered]);

  const hasScrapeDate = useMemo(
    () => vehicleData.some((v) => !!v.ScrapeDate),
    [vehicleData]
  );

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1 className="title">Vehicle Price Analytics</h1>
          <p className="subtitle">
            Filter + analyze listings from /public/vehicle_data.json
          </p>
        </div>
        <a
          className="ghostBtn"
          href="/vehicle_data.json"
          target="_blank"
          rel="noreferrer"
        >
          View JSON
        </a>
      </header>

      <section className="panel">
        <div className="controls">
          <div className="field">
            <label>Make</label>
            <select value={make} onChange={(e) => setMake(e.target.value)}>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Advanced search</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="toyota aqua 2014 (space = AND)"
            />
          </div>

          <div className="field">
            <label>Sort</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date_desc">Newest → Oldest (posting date)</option>
              <option value="date_asc">Oldest → Newest (posting date)</option>
              <option value="price_desc">Highest price</option>
              <option value="price_asc">Lowest price</option>
              <option value="mileage_asc">Lowest mileage</option>
              <option value="mileage_desc">Highest mileage</option>
            </select>
          </div>

          <div className="field">
            <label>Min price (LKR)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
            />
          </div>

          <div className="field">
            <label>Max price (LKR)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
            />
          </div>

          <div className="field">
            <label>Posting date from</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Posting date to</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* <div className="field">
            <label>Chart date field</label>
            <select
              value={chartDateField}
              onChange={(e) => setChartDateField(e.target.value)}
              disabled={!hasScrapeDate}
              title={
                !hasScrapeDate ? 'Add ScrapeDate in Python for this option' : ''
              }
            >
              <option value="Date">Posting date</option>
              <option value="ScrapeDate">Scrape date (trend)</option>
            </select>
          </div> */}
        </div>

        <div className="stats">
          <div className="stat">
            <div className="statLabel">Listings</div>
            <div className="statValue">{stats.count}</div>
          </div>
          <div className="stat">
            <div className="statLabel">Median</div>
            <div className="statValue">
              {stats.median ? LKR.format(stats.median) : '—'}
            </div>
          </div>
          <div className="stat">
            <div className="statLabel">Min</div>
            <div className="statValue">
              {stats.min ? LKR.format(stats.min) : '—'}
            </div>
          </div>
          <div className="stat">
            <div className="statLabel">Max</div>
            <div className="statValue">
              {stats.max ? LKR.format(stats.max) : '—'}
            </div>
          </div>
        </div>
      </section>

      {loading && <div className="message">Loading data…</div>}
      {error && (
        <div className="message error">
          <strong>Couldn’t load vehicle_data.json</strong>
          <div>{error}</div>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <section className="panel">
            <PriceChart data={filtered} dateField={chartDateField} />
          </section>

          <section className="grid">
            {filtered.map((v, idx) => (
              <article key={`${v.Link || v.Title}-${idx}`} className="card">
                <div className="cardTop">
                  <h2 className="cardTitle">{v.Title}</h2>
                  {v.DateKey && <span className="pill">{v.DateKey}</span>}
                </div>

                <div className="cardBody">
                  <div className="kv">
                    <span>Price</span>
                    <strong>
                      {typeof v.Price === 'number' ? LKR.format(v.Price) : '—'}
                    </strong>
                  </div>
                  {v.Location && (
                    <div className="kv">
                      <span>Location</span>
                      <strong>{v.Location}</strong>
                    </div>
                  )}
                  {typeof v.MileageNum === 'number' && (
                    <div className="kv">
                      <span>Mileage</span>
                      <strong>
                        {new Intl.NumberFormat('en-LK').format(v.MileageNum)} km
                      </strong>
                    </div>
                  )}
                  {!!v.ScrapeDateKey && (
                    <div className="kv">
                      <span>Scraped</span>
                      <strong>{v.ScrapeDateKey}</strong>
                    </div>
                  )}
                </div>

                {v.Link && (
                  <a
                    className="linkBtn"
                    href={v.Link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open listing →
                  </a>
                )}
              </article>
            ))}
          </section>
        </>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="message">No results match your filters.</div>
      )}
    </div>
  );
}

export default VehicleList;
