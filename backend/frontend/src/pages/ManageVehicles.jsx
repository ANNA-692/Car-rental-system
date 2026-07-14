import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../context/ToastContext";

export default function ManageVehicles() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCar, setEditCar] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    api.get("/cars?limit=100")
      .then(({ data }) => setCars(data.data))
      .catch(() => addToast("Failed to load vehicles", "error"))
      .finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async (car) => {
    try {
      const { data } = await api.put(`/cars/${car.id}`, { isAvailable: !car.isAvailable });
      setCars(cars.map((c) => c.id === car.id ? data.data : c));
      addToast(`${car.isAvailable ? "Marked as booked" : "Marked as available"}`, "success");
    } catch { addToast("Failed to update", "error"); }
  };

  const deleteCar = async (id) => {
    if (!confirm("Are you sure you want to deactivate this car?")) return;
    try {
      await api.delete(`/cars/${id}`);
      setCars(cars.filter((c) => c.id !== id));
      addToast("Car deactivated", "success");
    } catch { addToast("Failed to deactivate", "error"); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editCar, year: Number(editCar.year), seats: Number(editCar.seats), pricePerDay: Number(editCar.pricePerDay), deposit: Number(editCar.deposit) };
      const { data } = await api.put(`/cars/${editCar.id}`, payload);
      setCars(cars.map((c) => c.id === editCar.id ? data.data : c));
      setEditCar(null);
      addToast("Car updated", "success");
    } catch { addToast("Failed to update", "error"); }
  };

  if (loading) return <AdminLayout><div className="spinner" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-section-header">
        <h1>Manage Vehicles</h1>
        <Link to="/admin/cars/new" className="btn btn-success">+ Add Car</Link>
      </div>

      {editCar && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h2>Edit Car</h2>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Make</label><input value={editCar.make} onChange={(e) => setEditCar({ ...editCar, make: e.target.value })} required /></div>
              <div className="form-group"><label>Model</label><input value={editCar.model} onChange={(e) => setEditCar({ ...editCar, model: e.target.value })} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Year</label><input type="number" value={editCar.year} onChange={(e) => setEditCar({ ...editCar, year: e.target.value })} required /></div>
              <div className="form-group"><label>Color</label><input value={editCar.color || ""} onChange={(e) => setEditCar({ ...editCar, color: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>License Plate</label><input value={editCar.licensePlate} onChange={(e) => setEditCar({ ...editCar, licensePlate: e.target.value })} required /></div>
              <div className="form-group"><label>VIN</label><input value={editCar.vin} onChange={(e) => setEditCar({ ...editCar, vin: e.target.value })} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Category</label><select value={editCar.category} onChange={(e) => setEditCar({ ...editCar, category: e.target.value })}>
                <option>Sedan</option><option>SUV</option><option>Sports</option><option>Luxury</option><option>Truck</option><option>Van</option>
              </select></div>
              <div className="form-group"><label>Transmission</label><select value={editCar.transmission} onChange={(e) => setEditCar({ ...editCar, transmission: e.target.value })}>
                <option>Automatic</option><option>Manual</option>
              </select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Fuel Type</label><select value={editCar.fuelType} onChange={(e) => setEditCar({ ...editCar, fuelType: e.target.value })}>
                <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
              </select></div>
              <div className="form-group"><label>Seats</label><input type="number" value={editCar.seats} onChange={(e) => setEditCar({ ...editCar, seats: e.target.value })} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Price Per Day ($)</label><input type="number" step="0.01" value={editCar.pricePerDay} onChange={(e) => setEditCar({ ...editCar, pricePerDay: e.target.value })} required /></div>
              <div className="form-group"><label>Deposit ($)</label><input type="number" step="0.01" value={editCar.deposit} onChange={(e) => setEditCar({ ...editCar, deposit: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Location</label><input value={editCar.location} onChange={(e) => setEditCar({ ...editCar, location: e.target.value })} required /></div>
            <div className="form-group"><label>Description</label><textarea value={editCar.description || ""} onChange={(e) => setEditCar({ ...editCar, description: e.target.value })} rows="2" /></div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditCar(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Car</th><th>License Plate</th><th>Category</th><th>Price/Day</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {cars.filter((c) => c.isActive).map((c) => (
              <tr key={c.id}>
                <td><strong>{c.make} {c.model}</strong><br /><small style={{ color: "var(--text-muted)" }}>{c.year}</small></td>
                <td>{c.licensePlate}</td>
                <td>{c.category}</td>
                <td><strong>${c.pricePerDay}</strong></td>
                <td><span className={`status ${c.isAvailable ? "status-active" : "status-pending"}`}>{c.isAvailable ? "Available" : "Booked"}</span></td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => setEditCar(c)}>Edit</button>
                  <button className="btn btn-outline btn-sm" style={{ marginLeft: "0.3rem" }} onClick={() => toggleAvailability(c)}>{c.isAvailable ? "Mark Booked" : "Mark Available"}</button>
                  <button className="btn btn-danger btn-sm" style={{ marginLeft: "0.3rem" }} onClick={() => deleteCar(c.id)}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
