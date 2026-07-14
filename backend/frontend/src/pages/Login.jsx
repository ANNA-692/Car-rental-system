import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
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
      const loginData = await login(form.email.trim(), form.password);
      addToast("Login successful!", "success");
      setForm({ email: "", password: "" });
      
      // Redirect to dashboard based on user role
      if (loginData.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/bookings");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please try again.";
      setErrors({ submit: errorMessage });
      addToast(errorMessage, "error");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="auth-form">
        <div className="card">
          <h1>Login</h1>
          <p style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>Customers, staff, and admins can login here.</p>
          
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
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
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

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register here</Link>
            <br />
            <Link to="/cars">Browse Cars</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
