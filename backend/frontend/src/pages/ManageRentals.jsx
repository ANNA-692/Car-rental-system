import { useState, useEffect } from "react";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";

const statusClass = { PENDING: "status-pending", CONFIRMED: "status-confirmed", ACTIVE: "status-active", COMPLETED: "status-completed", CANCELLED: "status-cancelled" };

export default function ManageRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ACTIVE");
  const [mileageInput, setMileageInput] = useState(null);
  const [mileageValue, setMileageValue] = useState("");

  useEffect(() => {
    api.get(`/rentals?limit=100${filter ? `&status=${filter}` : ""}`)
      .then(({ data }) => setRentals(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const handleMileageSubmit = async (id, status) => {
    if (!mileageValue || isNaN(mileageValue) || parseInt(mileageValue) < 0) return;
    try {
      await api.patch(`/bookings/${id}/status`, { status, mileage: parseInt(mileageValue) });
      setRentals(rentals.filter((r) => r.id !== id));
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
        <h1>Manage Rentals</h1>
        <select className="search-input" style={{ maxWidth: "200px" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ACTIVE">Active Rentals</option>
          <option value="CONFIRMED">Upcoming</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="">All</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Customer</th><th>Car</th><th>Rental Period</th><th>Total</th><th>Deposit</th><th>Mileage Out</th><th>Mileage In</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {rentals.map((r) => (
              <tr key={r.id}>
                <td>{r.user?.firstName} {r.user?.lastName}<br /><small>{r.user?.phone}</small></td>
                <td>{r.car?.make} {r.car?.model}<br /><small>{r.car?.licensePlate}</small></td>
                <td>{new Date(r.startDate).toLocaleDateString()} - {new Date(r.endDate).toLocaleDateString()}</td>
                <td>${r.totalAmount}</td>
                <td>{r.depositPaid ? "Paid" : "Not Paid"}</td>
                <td>{r.mileageOut != null ? `${r.mileageOut} km` : "-"}</td>
                <td>{r.mileageIn != null ? `${r.mileageIn} km` : "-"}</td>
                <td><span className={`status ${statusClass[r.status] || ""}`}>{r.status}</span></td>
                <td>
                  {r.status === "CONFIRMED" && (
                    mileageInput === r.id ? (
                      <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                        <input type="number" min="0" className="search-input" style={{ width: "100px" }} placeholder="km" value={mileageValue} onChange={(e) => setMileageValue(e.target.value)} />
                        <button className="btn btn-primary btn-sm" onClick={() => handleMileageSubmit(r.id, "ACTIVE")}>Go</button>
                        <button className="btn btn-sm" style={{ background: "#ccc" }} onClick={() => setMileageInput(null)}>X</button>
                      </div>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => setMileageInput(r.id)}>Start Rental</button>
                    )
                  )}
                  {r.status === "ACTIVE" && (
                    mileageInput === r.id ? (
                      <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                        <input type="number" min="0" className="search-input" style={{ width: "100px" }} placeholder="km" value={mileageValue} onChange={(e) => setMileageValue(e.target.value)} />
                        <button className="btn btn-outline btn-sm" onClick={() => handleMileageSubmit(r.id, "COMPLETED")}>Go</button>
                        <button className="btn btn-sm" style={{ background: "#ccc" }} onClick={() => setMileageInput(null)}>X</button>
                      </div>
                    ) : (
                      <button className="btn btn-outline btn-sm" onClick={() => setMileageInput(r.id)}>Complete</button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
