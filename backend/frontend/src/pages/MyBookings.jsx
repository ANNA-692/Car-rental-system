import { useState, useEffect } from "react";
import api from "../api/client";
import { useToast } from "../context/ToastContext";

const statusClass = { PENDING: "status-pending", CONFIRMED: "status-confirmed", ACTIVE: "status-active", COMPLETED: "status-completed", CANCELLED: "status-cancelled" };

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchBookings = () => {
    api.get("/bookings")
      .then(({ data }) => setBookings(data.data))
      .catch(() => addToast("Failed to load bookings", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    try {
      await api.post(`/bookings/${id}/cancel`);
      addToast("Booking cancelled", "success");
      fetchBookings();
    } catch (err) {
      addToast(err.response?.data?.message || "Cancel failed", "error");
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="page">
      <div className="container">
        <h1>My Bookings</h1>
        {bookings.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--text-secondary)" }}>No bookings yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Car</th>
                  <th>Pickup</th>
                  <th>Return</th>
                  <th>Total</th>
                  <th>Mileage Out</th>
                  <th>Mileage In</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.car?.make} {b.car?.model}</td>
                    <td>{new Date(b.startDate).toLocaleDateString()}</td>
                    <td>{new Date(b.endDate).toLocaleDateString()}</td>
                    <td><strong>${b.totalAmount}</strong></td>
                    <td>{b.mileageOut != null ? `${b.mileageOut} km` : "-"}</td>
                    <td>{b.mileageIn != null ? `${b.mileageIn} km` : "-"}</td>
                    <td><span className={`status ${statusClass[b.status] || ""}`}>{b.status}</span></td>
                    <td>
                      {["PENDING", "CONFIRMED"].includes(b.status) && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
