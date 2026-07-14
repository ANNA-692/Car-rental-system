import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../context/ToastContext";

const statusClass = { PENDING: "status-pending", CONFIRMED: "status-confirmed", ACTIVE: "status-active", COMPLETED: "status-completed", CANCELLED: "status-cancelled" };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [staffCount, setStaffCount] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mileageInput, setMileageInput] = useState(null);
  const [mileageValue, setMileageValue] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    Promise.all([
      api.get("/reports/dashboard"),
      api.get("/bookings/all?limit=5"),
      api.get("/users?limit=1&role=STAFF"),
    ])
      .then(([statsRes, bookingsRes, staffRes]) => {
        setStats(statsRes.data.data);
        setBookings(bookingsRes.data.data);
        setStaffCount(staffRes.data.pagination?.total || 0);
      })
      .catch(() => addToast("Failed to load dashboard data", "error"))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status, mileage) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status, mileage });
      setBookings(bookings.map((b) => b.id === id ? { ...b, status } : b));
      setMileageInput(null);
      setMileageValue("");
      addToast(`Booking ${status.toLowerCase()}`, "success");
    } catch { addToast("Failed to update status", "error"); }
  };

  const handleMileageSubmit = async (id, status) => {
    if (!mileageValue || isNaN(mileageValue) || parseInt(mileageValue) < 0) return;
    await updateStatus(id, status, parseInt(mileageValue));
  };

  useEffect(() => {
    if (!mileageInput) setMileageValue("");
  }, [mileageInput]);

  if (loading) return <AdminLayout><div className="spinner" /></AdminLayout>;

  const statCards = stats ? [
    { label: "Total Cars", value: stats.totalCars, sub: `${stats.availableCars} Available` },
    { label: "Total Bookings", value: stats.totalBookings, sub: `${stats.pendingBookings} Pending` },
    { label: "Active Rentals", value: stats.activeRentals, sub: "Currently rented" },
    { label: "Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, sub: `${stats.totalPayments} Payments` },
    { label: "Customers", value: stats.totalCustomers, sub: "Registered" },
    { label: "Staff", value: staffCount, sub: <Link to="/admin/staff" style={{ color: "var(--primary)" }}>Manage Staff</Link> },
  ] : [];

  return (
    <AdminLayout>
      <h1>Dashboard</h1>
      <div className="stats-grid">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="admin-section-header">
        <h2>Recent Bookings</h2>
        <Link to="/admin/reservations" className="btn btn-outline">View All</Link>
      </div>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>User</th><th>Car</th><th>Dates</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.user?.firstName} {b.user?.lastName}</td>
                <td>{b.car?.make} {b.car?.model}</td>
                <td>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
                <td><strong>${b.totalAmount}</strong></td>
                <td><span className={`status ${statusClass[b.status] || ""}`}>{b.status}</span></td>
                <td>
                  {b.status === "PENDING" && <button className="btn btn-success btn-sm" onClick={() => updateStatus(b.id, "CONFIRMED")}>Confirm</button>}
                  {b.status === "CONFIRMED" && (
                    mileageInput === b.id ? (
                      <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                        <input type="number" min="0" className="search-input" style={{ width: "80px" }} placeholder="km" value={mileageValue} onChange={(e) => setMileageValue(e.target.value)} />
                        <button className="btn btn-primary btn-sm" onClick={() => handleMileageSubmit(b.id, "ACTIVE")}>Go</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setMileageInput(null)}>X</button>
                      </div>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => setMileageInput(b.id)}>Start</button>
                    )
                  )}
                  {b.status === "ACTIVE" && (
                    mileageInput === b.id ? (
                      <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                        <input type="number" min="0" className="search-input" style={{ width: "80px" }} placeholder="km" value={mileageValue} onChange={(e) => setMileageValue(e.target.value)} />
                        <button className="btn btn-outline btn-sm" onClick={() => handleMileageSubmit(b.id, "COMPLETED")}>Go</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setMileageInput(null)}>X</button>
                      </div>
                    ) : (
                      <button className="btn btn-outline btn-sm" onClick={() => setMileageInput(b.id)}>Complete</button>
                    )
                  )}
                  {["PENDING", "CONFIRMED"].includes(b.status) && <button className="btn btn-danger btn-sm" style={{ marginLeft: "0.3rem" }} onClick={() => updateStatus(b.id, "CANCELLED")}>Cancel</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
