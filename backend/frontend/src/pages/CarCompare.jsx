import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/client";
import { useToast } from "../context/ToastContext";

const SPECS = [
  { key: "make", label: "Make" },
  { key: "model", label: "Model" },
  { key: "year", label: "Year" },
  { key: "color", label: "Color" },
  { key: "category", label: "Category" },
  { key: "transmission", label: "Transmission" },
  { key: "fuelType", label: "Fuel Type" },
  { key: "seats", label: "Seats" },
  { key: "mileage", label: "Mileage (km)" },
  { key: "fuelLevel", label: "Fuel Level" },
  { key: "pricePerDay", label: "Price / Day", highlight: true },
  { key: "deposit", label: "Deposit" },
  { key: "location", label: "Location" },
];

export default function CarCompare() {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map((id) => api.get(`/cars/${id}`).then((r) => r.data.data)))
      .then((results) => setCars(results))
      .catch(() => addToast("Failed to load car details", "error"))
      .finally(() => setLoading(false));
  }, [ids, addToast]);

  if (loading) return <div className="page"><div className="container"><div className="spinner" /></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Compare Cars</h1>
          <Link to="/cars" className="btn btn-outline btn-sm">Back to Cars</Link>
        </div>

        {cars.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--text-secondary)" }}>No cars selected for comparison.</p>
            <Link to="/cars" className="btn btn-primary" style={{ marginTop: "1rem" }}>Browse Cars</Link>
          </div>
        ) : (
          <div className="comparison-grid">
            <div className="comparison-cell label"></div>
            {cars.map((car, i) => (
              <div key={car.id} className="comparison-header">
                <h3>{car.make} {car.model}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{car.year} &middot; {car.licensePlate}</p>
                <div className="price">${car.pricePerDay}<small>/day</small></div>
                <Link to={`/cars/${car.id}`} className="btn btn-primary btn-sm" style={{ marginTop: "0.5rem" }}>View Details</Link>
              </div>
            ))}

            {SPECS.map(({ key, label, highlight }) => (
              <div key={key} style={{ display: "contents" }}>
                <div className="comparison-cell label">{label}</div>
                {cars.map((car) => (
                  <div key={car.id} className={`comparison-cell ${highlight ? "highlight" : ""}`}>
                    {car[key] != null ? String(car[key]) : "-"}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
