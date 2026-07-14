import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import CarCard from "../components/CarCard";
import { useToast } from "../context/ToastContext";

const CATEGORIES = ["SUV", "SEDAN", "HATCHBACK", "COUPE", "CONVERTIBLE", "TRUCK", "VAN", "LUXURY", "ELECTRIC", "HYBRID"];
const TRANSMISSIONS = ["AUTOMATIC", "MANUAL", "CVT"];
const FUEL_TYPES = ["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID", "HYDROGEN"];
const SORT_OPTIONS = [
  { value: "pricePerDay:asc", label: "Price: Low to High" },
  { value: "pricePerDay:desc", label: "Price: High to Low" },
  { value: "year:desc", label: "Year: Newest First" },
  { value: "year:asc", label: "Year: Oldest First" },
  { value: "make:asc", label: "Make: A-Z" },
  { value: "createdAt:desc", label: "Newest Added" },
];

export default function CarList() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [compareIds, setCompareIds] = useState([]);
  const [heroSearch, setHeroSearch] = useState({
    pickup: "",
    returnToAnotherLocation: false,
    startDate: new Date().toISOString().slice(0, 10),
    startTime: "11:00",
    endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    endTime: "11:00",
  });
  const [filters, setFilters] = useState({
    location: "",
    category: "", transmission: "", fuelType: "", seats: "",
    minPrice: "", maxPrice: "", search: "", sort: "pricePerDay:asc",
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const { addToast } = useToast();

  const limit = 12;

  useEffect(() => {
    setPage(1);
  }, [activeFilters]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("limit", limit);
    params.set("page", page);
    params.set("available", "true");

    Object.entries(activeFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });

    const [sortField, sortOrder] = (activeFilters.sort || "pricePerDay:asc").split(":");
    params.set("sort", sortField);
    params.set("order", sortOrder);

    setLoading(true);
    api.get(`/cars?${params.toString()}`)
      .then(({ data }) => {
        setCars(data.data || []);
        setTotal(data.pagination?.total || 0);
      })
      .catch(() => addToast("Failed to load cars", "error"))
      .finally(() => setLoading(false));
  }, [page, activeFilters, addToast]);

  const applyFilters = () => {
    const active = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) active[k] = v;
    });
    setActiveFilters(active);
  };

  const clearFilters = () => {
    setFilters({ category: "", transmission: "", fuelType: "", seats: "", minPrice: "", maxPrice: "", search: "", sort: "pricePerDay:asc" });
    setActiveFilters({});
  };

  const removeFilter = (key) => {
    const updated = { ...activeFilters };
    delete updated[key];
    setActiveFilters(updated);
    setFilters((f) => ({ ...f, [key]: "" }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") applyFilters();
  };

  const handleHeroSearch = () => {
    setFilters((current) => ({
      ...current,
      location: heroSearch.pickup,
    }));
    setActiveFilters((current) => ({
      ...current,
      location: heroSearch.pickup || undefined,
    }));
  };

  const toggleCompare = (id) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page">
      <div className="container">
        <section className="landing-hero">
          <div className="hero-search-card">
            <div className="hero-card-top">
              <h2>Pickup</h2>
              <span>Type in City or Airport Code</span>
            </div>
            <div className="form-group">
              <input
                placeholder="Type in City or Airport Code"
                value={heroSearch.pickup}
                onChange={(e) => setHeroSearch({ ...heroSearch, pickup: e.target.value })}
              />
            </div>
            <div className="hero-row hero-checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={heroSearch.returnToAnotherLocation}
                  onChange={(e) => setHeroSearch({ ...heroSearch, returnToAnotherLocation: e.target.checked })}
                />
                Return car to another location?
              </label>
            </div>
            <div className="hero-row">
              <div className="form-group">
                <label>Rental Start</label>
                <input
                  type="date"
                  value={heroSearch.startDate}
                  onChange={(e) => setHeroSearch({ ...heroSearch, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>&nbsp;</label>
                <input
                  type="time"
                  value={heroSearch.startTime}
                  onChange={(e) => setHeroSearch({ ...heroSearch, startTime: e.target.value })}
                />
              </div>
            </div>
            <div className="hero-row">
              <div className="form-group">
                <label>Rental End</label>
                <input
                  type="date"
                  value={heroSearch.endDate}
                  onChange={(e) => setHeroSearch({ ...heroSearch, endDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>&nbsp;</label>
                <input
                  type="time"
                  value={heroSearch.endTime}
                  onChange={(e) => setHeroSearch({ ...heroSearch, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="hero-row hero-age-row">
              <div className="hero-age-pill">Drivers Age at Rental start: 20-65</div>
            </div>
            <button type="button" className="btn btn-primary hero-search-btn" onClick={handleHeroSearch}>
              Search
            </button>
          </div>

          <div className="hero-preview-card">
            <div className="hero-preview-copy">
              <span className="hero-pill">Mollash Car Rentals</span>
              <h1>Car Rental</h1>
              <p>Your one and only car rental which is affordable, reliable, and always available to meet your needs and standards.</p>
              <div className="hero-feature-list">
                <span>No Hidden Fees</span>
                <span>No Credit Card Fees</span>
                <span>No Amendment Fees</span>
              </div>
            </div>
            <div className="hero-image" />
          </div>
        </section>

        <div className="page-header">
          <h1>Available Cars {total > 0 && <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>({total})</span>}</h1>
          <button className="btn btn-outline btn-sm" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {showFilters && (
          <div className="filters-bar">
            <div className="filter-group">
              <label>Search</label>
              <input placeholder="Make or model..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} onKeyDown={handleKeyDown} />
            </div>
            <div className="filter-group">
              <label>Category</label>
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                <option value="">All</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Transmission</label>
              <select value={filters.transmission} onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}>
                <option value="">All</option>
                {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Fuel Type</label>
              <select value={filters.fuelType} onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}>
                <option value="">All</option>
                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Min Seats</label>
              <select value={filters.seats} onChange={(e) => setFilters({ ...filters, seats: e.target.value })}>
                <option value="">Any</option>
                {[2, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}+</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Min Price</label>
              <input type="number" min="0" placeholder="$0" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
            </div>
            <div className="filter-group">
              <label>Max Price</label>
              <input type="number" min="0" placeholder="$999" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
            </div>
            <div className="filter-group">
              <label>Sort By</label>
              <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="sort-select">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignSelf: "flex-end" }}>
              <button className="btn btn-primary btn-sm" onClick={applyFilters}>Apply</button>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear</button>
            </div>
          </div>
        )}

        {Object.keys(activeFilters).filter((k) => k !== "sort").length > 0 && (
          <div className="active-filters">
            {Object.entries(activeFilters).filter(([k]) => k !== "sort").map(([key, val]) => (
              <span key={key} className="filter-tag">
                {key}: {val}
                <button onClick={() => removeFilter(key)}>&times;</button>
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div className="spinner" />
        ) : cars.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>No cars match your filters.</p>
            <button className="btn btn-outline" style={{ marginTop: "1rem" }} onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="grid">
              {cars.map((car) => (
                <div key={car.id} style={{ position: "relative" }}>
                  <label className="compare-checkbox" style={{ position: "absolute", top: "0.75rem", right: "0.75rem", zIndex: 2, background: "var(--bg-card)", padding: "0.2rem 0.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                    <input type="checkbox" checked={compareIds.includes(car.id)} onChange={() => toggleCompare(car.id)} />
                    Compare
                  </label>
                  <CarCard car={car} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={page === p ? "active" : ""} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
                <span className="page-info">{total} cars</span>
              </div>
            )}
          </>
        )}

        {compareIds.length > 0 && (
          <div className="compare-bar">
            <div className="compare-count">
              {compareIds.length} car{compareIds.length > 1 ? "s" : ""} selected
            </div>
            <div className="compare-actions">
              <Link to={`/compare?ids=${compareIds.join(",")}`} className="btn btn-primary btn-sm">
                Compare Now
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={() => setCompareIds([])}>Clear</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
