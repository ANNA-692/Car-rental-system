import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useToast } from "../context/ToastContext";

export default function CreateCar() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    make: "", model: "", year: "", licensePlate: "", vin: "", category: "Sedan",
    transmission: "Automatic", fuelType: "Petrol", seats: 4, pricePerDay: "", location: "",
    description: "", color: "", deposit: 0, mileage: "", conditionNotes: "", image: null,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          if (key === "image") {
            formData.append("image", value);
          } else {
            formData.append(key, value);
          }
        }
      });

      await api.post("/cars", formData);
      addToast("Car added successfully", "success");
      navigate("/admin/vehicles");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create car", "error");
    }
    setSaving(false);
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: "800px" }}>
        <h1>Add Car</h1>
        <div className="card">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-row">
              <div className="form-group"><label>Make</label><input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required /></div>
              <div className="form-group"><label>Model</label><input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Year</label><input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required /></div>
              <div className="form-group"><label>Color</label><input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>License Plate</label><input value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} required /></div>
              <div className="form-group"><label>VIN</label><input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>Sedan</option><option>SUV</option><option>Sports</option><option>Luxury</option><option>Truck</option><option>Van</option>
              </select></div>
              <div className="form-group"><label>Transmission</label><select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })}>
                <option>Automatic</option><option>Manual</option>
              </select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Fuel Type</label><select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>
                <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
              </select></div>
              <div className="form-group"><label>Seats</label><input type="number" min="1" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Price Per Day ($)</label><input type="number" step="0.01" value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} required /></div>
              <div className="form-group"><label>Deposit ($)</label><input type="number" step="0.01" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Mileage (km)</label><input type="number" min="0" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} /></div>
              <div className="form-group"><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
            </div>
            <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" /></div>
            <div className="form-group"><label>Condition Notes</label><textarea value={form.conditionNotes} onChange={(e) => setForm({ ...form, conditionNotes: e.target.value })} rows="3" /></div>
            <div className="form-group"><label>Car Image</label><input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} /></div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Add Car"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
