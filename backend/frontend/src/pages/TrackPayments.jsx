import { useState, useEffect } from "react";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";

export default function TrackPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    api.get(`/rentals?limit=200${statusFilter ? `&status=${statusFilter}` : ""}`)
      .then(({ data }) => {
        const allPayments = data.data.flatMap((r) =>
          r.payment ? [{ ...r.payment, user: r.user, booking: r }] : []
        );
        setPayments(allPayments);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const refundPayment = async (bookingId) => {
    if (!confirm("Refund this payment?")) return;
    try {
      await api.post(`/payments/${bookingId}/refund`);
      setPayments(payments.map((p) => p.bookingId === bookingId ? { ...p, status: "REFUNDED" } : p));
    } catch {}
  };

  if (loading) return <AdminLayout><div className="spinner" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-section-header">
        <h1>Track Payments</h1>
        <select className="search-input" style={{ maxWidth: "200px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Customer</th><th>Booking</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.user?.firstName} {p.user?.lastName}</td>
                <td>{p.booking?.car?.make} {p.booking?.car?.model}</td>
                <td>${p.amount}</td>
                <td>{p.method}</td>
                <td><span className={`status ${p.status === "PAID" ? "status-active" : p.status === "REFUNDED" ? "status-cancelled" : "status-pending"}`}>{p.status}</span></td>
                <td>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "-"}</td>
                <td>
                  {p.status === "PAID" && <button className="btn btn-danger btn-sm" onClick={() => refundPayment(p.bookingId)}>Refund</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
