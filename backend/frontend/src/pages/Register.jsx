import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    driverLicense: "",
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    vin: "",
    category: "Sedan",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: "",
    pricePerDay: "",
    deposit: "",
    mileage: "",
    location: "",
    description: "",
    conditionNotes: "",
    invoiceImage: null
  });
  const [showVehicle, setShowVehicle] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register, setUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Last name validation
    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Phone validation (optional but if provided, should be valid)
    if (form.phone && form.phone.length < 10) {
      newErrors.phone = "Phone number should be at least 10 digits";
    }

    // Vehicle validation (only if vehicle section is visible and make is provided)
    if (showVehicle && form.make) {
      if (!form.model.trim()) newErrors.model = "Model is required";
      if (!form.year) newErrors.year = "Year is required";
      else if (isNaN(form.year) || form.year < 1886 || form.year > 2030) newErrors.year = "Year must be between 1886 and 2030";
      if (!form.licensePlate.trim()) newErrors.licensePlate = "License plate is required";
      if (!form.vin.trim()) newErrors.vin = "VIN is required";
      if (!form.seats) newErrors.seats = "Seats is required";
      else if (isNaN(form.seats) || form.seats < 1 || form.seats > 50) newErrors.seats = "Seats must be between 1 and 50";
      if (!form.pricePerDay) newErrors.pricePerDay = "Price per day is required";
      else if (isNaN(form.pricePerDay) || form.pricePerDay < 0) newErrors.pricePerDay = "Price must be a positive number";
      if (!form.location.trim()) newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast("Please fix the errors below", "error");
      return;
    }

    setLoading(true);
    try {
      if (form.invoiceImage) {
        const fd = new FormData();
        const fields = ["firstName","lastName","email","password","phone","address","driverLicense","make","model","year","color","licensePlate","vin","category","transmission","fuelType","seats","pricePerDay","deposit","mileage","location","description","conditionNotes"];
        fields.forEach((k) => { if (form[k]) fd.append(k, form[k]); });
        fd.append("invoiceImage", form.invoiceImage);
        const { data } = await api.post("/auth/register", fd);
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        setUser(data.data.user);
      } else {
        const { confirmPassword, ...registrationData } = form;
        await register(registrationData);
      }
      addToast("Account created successfully! Welcome.", "success");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: "",
        driverLicense: ""
      });
      navigate("/cars");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Registration failed. Please try again.";
      setErrors({ submit: errorMessage });
      addToast(errorMessage, "error");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="auth-form">
        <div className="card">
          <h1>Create Account</h1>
          <p style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Join us to start booking vehicles
          </p>

          {errors.submit && (
            <div style={{
              padding: "0.75rem",
              marginBottom: "1rem",
              backgroundColor: "var(--danger-bg)",
              border: "1px solid var(--danger)",
              borderRadius: "var(--radius)",
              color: "var(--danger)",
              fontSize: "0.9rem"
            }}>
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  disabled={loading}
                  style={{
                    borderColor: errors.firstName ? "var(--danger)" : "var(--border)"
                  }}
                />
                {errors.firstName && (
                  <span style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.firstName}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  disabled={loading}
                  style={{
                    borderColor: errors.lastName ? "var(--danger)" : "var(--border)"
                  }}
                />
                {errors.lastName && (
                  <span style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                disabled={loading}
                style={{
                  borderColor: errors.email ? "var(--danger)" : "var(--border)"
                }}
              />
              {errors.email && (
                <span style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  disabled={loading}
                  style={{
                    borderColor: errors.password ? "var(--danger)" : "var(--border)"
                  }}
                />
                {errors.password && (
                  <span style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.password}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  disabled={loading}
                  style={{
                    borderColor: errors.confirmPassword ? "var(--danger)" : "var(--border)"
                  }}
                />
                {errors.confirmPassword && (
                  <span style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone (optional)</label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                disabled={loading}
                style={{
                  borderColor: errors.phone ? "var(--danger)" : "var(--border)"
                }}
              />
              {errors.phone && (
                <span style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                  {errors.phone}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address">Address (optional)</label>
              <input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Your residential address"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="driverLicense">Driver License (optional)</label>
              <input
                id="driverLicense"
                name="driverLicense"
                value={form.driverLicense}
                onChange={handleChange}
                placeholder="Your driver license number"
                disabled={loading}
              />
            </div>

            <div className="vehicle-reg-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showVehicle}
                  onChange={(e) => setShowVehicle(e.target.checked)}
                  disabled={loading}
                />
                <span>Register my vehicle</span>
              </label>
            </div>

            {showVehicle && (
              <div className="vehicle-reg-section">
                <h3>Vehicle Details</h3>
                <p className="section-note">Your vehicle will be listed after admin approval.</p>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="make">Make *</label>
                    <input
                      id="make"
                      name="make"
                      value={form.make}
                      onChange={handleChange}
                      placeholder="e.g. Toyota, Honda"
                      disabled={loading}
                      style={{ borderColor: errors.make ? "var(--danger)" : "var(--border)" }}
                    />
                    {errors.make && <span className="field-error">{errors.make}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="model">Model *</label>
                    <input
                      id="model"
                      name="model"
                      value={form.model}
                      onChange={handleChange}
                      placeholder="e.g. Corolla, Civic"
                      disabled={loading}
                      style={{ borderColor: errors.model ? "var(--danger)" : "var(--border)" }}
                    />
                    {errors.model && <span className="field-error">{errors.model}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="year">Year *</label>
                    <input
                      id="year"
                      name="year"
                      type="number"
                      value={form.year}
                      onChange={handleChange}
                      placeholder="e.g. 2020"
                      disabled={loading}
                      style={{ borderColor: errors.year ? "var(--danger)" : "var(--border)" }}
                    />
                    {errors.year && <span className="field-error">{errors.year}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="color">Color</label>
                    <input
                      id="color"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      placeholder="e.g. White, Blue"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="licensePlate">License Plate *</label>
                    <input
                      id="licensePlate"
                      name="licensePlate"
                      value={form.licensePlate}
                      onChange={handleChange}
                      placeholder="e.g. ABC 1234"
                      disabled={loading}
                      style={{ borderColor: errors.licensePlate ? "var(--danger)" : "var(--border)" }}
                    />
                    {errors.licensePlate && <span className="field-error">{errors.licensePlate}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="vin">VIN *</label>
                    <input
                      id="vin"
                      name="vin"
                      value={form.vin}
                      onChange={handleChange}
                      placeholder="Vehicle identification number"
                      disabled={loading}
                      style={{ borderColor: errors.vin ? "var(--danger)" : "var(--border)" }}
                    />
                    {errors.vin && <span className="field-error">{errors.vin}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Sports">Sports</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="transmission">Transmission</label>
                    <select
                      id="transmission"
                      name="transmission"
                      value={form.transmission}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fuelType">Fuel Type</label>
                    <select
                      id="fuelType"
                      name="fuelType"
                      value={form.fuelType}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="seats">Seats *</label>
                    <input
                      id="seats"
                      name="seats"
                      type="number"
                      value={form.seats}
                      onChange={handleChange}
                      placeholder="e.g. 5"
                      disabled={loading}
                      style={{ borderColor: errors.seats ? "var(--danger)" : "var(--border)" }}
                    />
                    {errors.seats && <span className="field-error">{errors.seats}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="pricePerDay">Price Per Day ($) *</label>
                    <input
                      id="pricePerDay"
                      name="pricePerDay"
                      type="number"
                      step="0.01"
                      value={form.pricePerDay}
                      onChange={handleChange}
                      placeholder="e.g. 50"
                      disabled={loading}
                      style={{ borderColor: errors.pricePerDay ? "var(--danger)" : "var(--border)" }}
                    />
                    {errors.pricePerDay && <span className="field-error">{errors.pricePerDay}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="deposit">Deposit ($)</label>
                    <input
                      id="deposit"
                      name="deposit"
                      type="number"
                      step="0.01"
                      value={form.deposit}
                      onChange={handleChange}
                      placeholder="e.g. 200"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="mileage">Mileage (km)</label>
                    <input
                      id="mileage"
                      name="mileage"
                      type="number"
                      value={form.mileage}
                      onChange={handleChange}
                      placeholder="e.g. 50000"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="location">Location *</label>
                    <input
                      id="location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Harare"
                      disabled={loading}
                      style={{ borderColor: errors.location ? "var(--danger)" : "var(--border)" }}
                    />
                    {errors.location && <span className="field-error">{errors.location}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your vehicle's condition, features, etc."
                    disabled={loading}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="conditionNotes">Condition Notes</label>
                  <textarea
                    id="conditionNotes"
                    name="conditionNotes"
                    value={form.conditionNotes}
                    onChange={handleChange}
                    placeholder="Any scratches, dents, or other condition notes"
                    disabled={loading}
                    rows="2"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="invoiceImage">Invoice Image</label>
              <input
                id="invoiceImage"
                type="file"
                name="invoiceImage"
                accept="image/*"
                onChange={(e) => setForm({ ...form, invoiceImage: e.target.files[0] })}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
