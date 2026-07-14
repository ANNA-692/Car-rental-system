import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";

export default function CarTracking() {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [carDetails, setCarDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fuelInput, setFuelInput] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tracking/dashboard");
      setDashboardData(data.data);
    } catch (err) {
      console.error("Error loading tracking dashboard:", err);
    }
    setLoading(false);
  };

  const selectCar = async (car) => {
    setSelectedCar(car);
    try {
      const { data } = await api.get(`/tracking/${car.id}`);
      setCarDetails(data.data);
    } catch (err) {
      console.error("Error loading car details:", err);
    }
  };

  const updateFuelLevel = async (carId) => {
    if (!fuelInput || isNaN(fuelInput) || fuelInput < 0 || fuelInput > 100) {
      alert("Please enter a valid fuel level (0-100)");
      return;
    }

    try {
      await api.patch(`/tracking/${carId}/fuel`, { fuelLevel: parseFloat(fuelInput) });
      setFuelInput("");
      await loadDashboard();
      if (selectedCar) selectCar({ ...selectedCar, id: carId });
    } catch (err) {
      console.error("Error updating fuel level:", err);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      "IN_USE": { background: "#ff6b6b", color: "white" },
      AVAILABLE: { background: "#51cf66", color: "white" },
      UNAVAILABLE: { background: "#ffa94d", color: "white" },
    };
    return (
      <span
        style={{
          padding: "0.4rem 0.8rem",
          borderRadius: "4px",
          fontSize: "0.85rem",
          fontWeight: "bold",
          ...styles[status],
        }}
      >
        {status}
      </span>
    );
  };

  const getFuelColor = (fuelLevel) => {
    if (fuelLevel >= 75) return "#51cf66"; // Green
    if (fuelLevel >= 50) return "#ffa94d"; // Orange
    if (fuelLevel >= 25) return "#ff922b"; // Dark Orange
    return "#ff6b6b"; // Red
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-section-header">
          <h1>Car Tracking</h1>
        </div>
        <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading tracking data...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-section-header">
        <h1>Car Tracking Dashboard</h1>
        <button className="btn btn-primary" onClick={loadDashboard}>
          Refresh Data
        </button>
      </div>

      {dashboardData && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{dashboardData.summary.totalCars}</div>
            <div className="stat-label">Total Cars</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{dashboardData.summary.availableCars}</div>
            <div className="stat-label">Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{dashboardData.summary.activeCars}</div>
            <div className="stat-label">In Use</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{dashboardData.summary.maintenanceCars}</div>
            <div className="stat-label">Maintenance</div>
          </div>
        </div>
      )}

      <div className="form-row" style={{ marginTop: "2rem", gap: "2rem" }}>
        {/* Car List */}
        <div className="card" style={{ flex: "1 1 40%" }}>
          <h2>Fleet Status</h2>
          <div
            style={{
              maxHeight: "600px",
              overflowY: "auto",
              border: "1px solid var(--border)",
              borderRadius: "4px",
            }}
          >
            {dashboardData?.carTracking?.map((car) => (
              <div
                key={car.id}
                onClick={() => selectCar(car)}
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  background: selectedCar?.id === car.id ? "var(--primary-bg)" : "transparent",
                  transition: "background 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: "1rem" }}>
                      {car.year} {car.make} {car.model}
                    </strong>
                    <p style={{ margin: "0.25rem 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {car.licensePlate} • {car.location}
                    </p>
                  </div>
                  {getStatusBadge(car.status)}
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
                  <span style={{ marginRight: "1rem" }}>📏 {car.mileage} km</span>
                  <span style={{ marginRight: "1rem" }}>⛽ {car.fuelLevel}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Car Details */}
        {selectedCar && carDetails && (
          <div className="card" style={{ flex: "1 1 60%" }}>
            <h2>
              {selectedCar.year} {selectedCar.make} {selectedCar.model}
            </h2>

            {/* Current Status */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h3>Current Status</h3>
              <div className="stats-grid" style={{ marginTop: "0.5rem" }}>
                <div className="stat-card">
                  <div className="stat-value">{selectedCar.licensePlate}</div>
                  <div className="stat-label">License Plate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{selectedCar.mileage}</div>
                  <div className="stat-label">Mileage (km)</div>
                </div>
                <div className="stat-card">
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: getFuelColor(selectedCar.fuelLevel),
                    }}
                  >
                    {selectedCar.fuelLevel}%
                  </div>
                  <div className="stat-label">Fuel Level</div>
                </div>
              </div>

              {/* Update Fuel Level */}
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter fuel level %"
                  value={fuelInput}
                  onChange={(e) => setFuelInput(e.target.value)}
                  style={{ flex: 1, padding: "0.5rem" }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => updateFuelLevel(selectedCar.id)}
                  style={{ whiteSpace: "nowrap" }}
                >
                  Update Fuel
                </button>
              </div>
            </div>

            {/* Current Rental */}
            {selectedCar.currentRental && (
              <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--info-bg)", borderRadius: "4px" }}>
                <h3>Currently Rented</h3>
                <p style={{ margin: "0.25rem 0" }}>
                  <strong>Customer:</strong> {selectedCar.currentRental.customer}
                </p>
                <p style={{ margin: "0.25rem 0", fontSize: "0.85rem" }}>
                  {selectedCar.currentRental.email} • {selectedCar.currentRental.phone}
                </p>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Pickup: {selectedCar.currentRental.pickupLocation}
                </p>
                <p style={{ margin: "0.25rem 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Return: {selectedCar.currentRental.dropoffLocation}
                </p>
                <p style={{ margin: "0.25rem 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Due: {new Date(selectedCar.currentRental.endDate).toLocaleString()}
                </p>
              </div>
            )}

            {/* Stats */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h3>Utilization Stats</h3>
              <table style={{ width: "100%", fontSize: "0.9rem" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "0.5rem" }}>Total Rentals:</td>
                    <td style={{ padding: "0.5rem", fontWeight: "bold" }}>
                      {carDetails.stats.totalTrips}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "0.5rem" }}>Completed:</td>
                    <td style={{ padding: "0.5rem", fontWeight: "bold" }}>
                      {carDetails.stats.completedTrips}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "0.5rem" }}>Total Revenue:</td>
                    <td style={{ padding: "0.5rem", fontWeight: "bold" }}>
                      ${carDetails.stats.totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "0.5rem" }}>Avg Fuel Consumption:</td>
                    <td style={{ padding: "0.5rem", fontWeight: "bold" }}>
                      {carDetails.utilization.avgFuelConsumption.toFixed(2)}% per trip
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pending Maintenance */}
            {selectedCar.pendingMaintenance?.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h3>Pending Maintenance</h3>
                {selectedCar.pendingMaintenance.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: "0.75rem",
                      marginBottom: "0.5rem",
                      background: "#fff3cd",
                      borderLeft: "4px solid #ffc107",
                      borderRadius: "4px",
                    }}
                  >
                    <p style={{ margin: "0", fontSize: "0.9rem", fontWeight: "bold" }}>
                      {m.type}
                    </p>
                    <p style={{ margin: "0.25rem 0", fontSize: "0.85rem" }}>
                      {m.description}
                    </p>
                    <p style={{ margin: "0.25rem 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Cost: ${m.cost?.toLocaleString() || "TBD"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Rentals */}
            {selectedCar.rentalHistory?.length > 0 && (
              <div>
                <h3>Recent Rentals</h3>
                <table style={{ width: "100%", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>Date</th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>Distance</th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>Fuel Used</th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCar.rentalHistory.map((rental) => (
                      <tr key={rental.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "0.5rem" }}>
                          {new Date(rental.startDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "0.5rem" }}>
                          {rental.mileageIn && rental.mileageOut
                            ? `${rental.mileageIn - rental.mileageOut} km`
                            : "N/A"}
                        </td>
                        <td style={{ padding: "0.5rem" }}>
                          {rental.fuelAtPickup && rental.fuelAtDropoff
                            ? `${(rental.fuelAtPickup - rental.fuelAtDropoff).toFixed(2)}%`
                            : "N/A"}
                        </td>
                        <td style={{ padding: "0.5rem" }}>{rental.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
