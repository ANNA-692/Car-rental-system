import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function CarDetail() {
  const { id } = useParams();
  const { user, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ startDate: "", endDate: "", pickupLocation: "", notes: "" });
  const [regForm, setRegForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "", address: "", driverLicense: "" });

  useEffect(() => {
    api.get(`/cars/${id}`)
      .then(({ data }) => setCar(data.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(regForm);
      addToast("Account created! You can now book this car.", "success");
      setRegForm({ firstName: "", lastName: "", email: "", password: "", phone: "", address: "", driverLicense: "" });
    } catch (err) {
      addToast(err.response?.data?.message || "Registration failed", "error");
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await api.post("/bookings", { carId: id, ...booking });
      addToast("Booking confirmed! Check your bookings page.", "success");
      setBooking({ startDate: "", endDate: "", pickupLocation: "", notes: "" });
    } catch (err) {
      addToast(err.response?.data?.message || "Booking failed", "error");
    }
  };

  if (loading) return <div className="spinner" />;
  if (!car) return null;

  return (
    <div className="page">
      <div className="container">
        <div className="car-detail">
          <div>
            <h1>{car.make} {car.model}</h1>
            <div className="price">${car.pricePerDay}<small>/day</small></div>
            <div style={{ margin: "1rem 0" }}>
              <span className={`badge ${car.isAvailable ? "badge-available" : "badge-unavailable"}`}>
                {car.isAvailable ? "Available" : "Currently Booked"}
              </span>
            </div>
            <p>{car.description}</p>
            <div className="specs">
              <div className="spec"><div className="spec-label">Year</div><div className="spec-value">{car.year}</div></div>
              <div className="spec"><div className="spec-label">Transmission</div><div className="spec-value">{car.transmission}</div></div>
              <div className="spec"><div className="spec-label">Fuel Type</div><div className="spec-value">{car.fuelType}</div></div>
              <div className="spec"><div className="spec-label">Seats</div><div className="spec-value">{car.seats}</div></div>
              <div className="spec"><div className="spec-label">Category</div><div className="spec-value">{car.category}</div></div>
              <div className="spec"><div className="spec-label">Location</div><div className="spec-value">{car.location}</div></div>
              <div className="spec"><div className="spec-label">License Plate</div><div className="spec-value">{car.licensePlate}</div></div>
              <div className="spec"><div className="spec-label">Deposit</div><div className="spec-value">${car.deposit}</div></div>
            </div>
            {car.features && <p><strong>Features:</strong> {car.features}</p>}
          </div>
          {user && car.isAvailable ? (
            <div className="booking-form">
              <h2>Book this Car</h2>
              <form onSubmit={handleBook}>
                <div className="form-group">
                  <label>Pickup Date</label>
                  <input type="date" value={booking.startDate} onChange={(e) => setBooking({ ...booking, startDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Return Date</label>
                  <input type="date" value={booking.endDate} onChange={(e) => setBooking({ ...booking, endDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Pickup Location</label>
                  <input value={booking.pickupLocation} onChange={(e) => setBooking({ ...booking, pickupLocation: e.target.value })} placeholder={car.location} />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea value={booking.notes} onChange={(e) => setBooking({ ...booking, notes: e.target.value })} rows="3" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Book Now</button>
              </form>
            </div>
          ) : !user ? (
            <div className="booking-form">
              <h2>Register to Book</h2>
              <form onSubmit={handleRegister}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input value={regForm.firstName} onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input value={regForm.lastName} onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Phone (optional)</label>
                  <input value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Address (optional)</label>
                  <input value={regForm.address} onChange={(e) => setRegForm({ ...regForm, address: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Driver License (optional)</label>
                  <input value={regForm.driverLicense} onChange={(e) => setRegForm({ ...regForm, driverLicense: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Register & Book</button>
              </form>
              <p className="auth-footer">
                Staff? <a href="/login">Staff Login</a>
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
