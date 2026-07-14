import { useState, useEffect } from "react";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";

const statusClass = { PENDING: "status-pending", CONFIRMED: "status-confirmed", ACTIVE: "status-active", COMPLETED: "status-completed", CANCELLED: "status-cancelled" };

export default function ManageReservations() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [mileageInput, setMileageInput] = useState(null);
  const [mileageValue, setMileageValue] = useState("");

  useEffect(() => {
    const url = `/bookings/all?limit=100${statusFilter ? `&status=${statusFilter}` : ""}`;
    api.get(url)
      .then(({ data }) => setBookings(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings(bookings.map((b) => b.id === id ? { ...b, status } : b));
    } catch {}
  };

  const handleMileageSubmit = async (id, status) => {
    if (!mileageValue || isNaN(mileageValue) || parseInt(mileageValue) < 0) return;
    try {
      await api.patch(`/bookings/${id}/status`, { status, mileage: parseInt(mileageValue) });
      setBookings(bookings.map((b) => b.id === id ? { ...b, status, [status === "ACTIVE" ? "mileageOut" : "mileageIn"]: parseInt(mileageValue) } : b));
      setMileageInput(null);
      setMileageValue("");
    } catch {}
  };

  useEffect(() => {
    if (!mileageInput) setMileageValue("");
  }, [mileageInput]);

  if (loading) return <AdminLayout><div className="spinner" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-section-header">
        <h1>Manage Reservations</h1>
        <select className="search-input" style={{ maxWidth: "200px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>User</th><th>Car</th><th>Pickup</th><th>Dropoff</th><th>Dates</th><th>Amount</th><th>Mileage Out</th><th>Mileage In</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.user?.firstName} {b.user?.lastName}</td>
                <td>{b.car?.make} {b.car?.model}</td>
                <td>{b.pickupLocation || "-"}</td>
                <td>{b.dropoffLocation || "-"}</td>
                <td>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
                <td>${b.totalAmount}</td>
                <td>{b.mileageOut != null ? `${b.mileageOut} km` : "-"}</td>
                <td>{b.mileageIn != null ? `${b.mileageIn} km` : "-"}</td>
                <td><span className={`status ${statusClass[b.status] || ""}`}>{b.status}</span></td>
                <td>
                  {b.status === "PENDING" && <button className="btn btn-success btn-sm" onClick={() => updateStatus(b.id, "CONFIRMED")}>Confirm</button>}
                  {b.status === "CONFIRMED" && (
                    mileageInput === b.id ? (
                      <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                        <input type="number" min="0" className="search-input" style={{ width: "100px" }} placeholder="km" value={mileageValue} onChange={(e) => setMileageValue(e.target.value)} />
                        <button className="btn btn-primary btn-sm" onClick={() => handleMileageSubmit(b.id, "ACTIVE")}>Go</button>
                        <button className="btn btn-sm" style={{ background: "#ccc" }} onClick={() => setMileageInput(null)}>X</button>
                      </div>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => setMileageInput(b.id)}>Start Rental</button>
                    )
                  )}
                  {b.status === "ACTIVE" && (
                    mileageInput === b.id ? (
                      <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                        <input type="number" min="0" className="search-input" style={{ width: "100px" }} placeholder="km" value={mileageValue} onChange={(e) => setMileageValue(e.target.value)} />
                        <button className="btn btn-outline btn-sm" onClick={() => handleMileageSubmit(b.id, "COMPLETED")}>Go</button>
                        <button className="btn btn-sm" style={{ background: "#ccc" }} onClick={() => setMileageInput(null)}>X</button>
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
