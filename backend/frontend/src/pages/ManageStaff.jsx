import { useState, useEffect } from "react";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../context/ToastContext";

export default function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", phone: "", role: "STAFF",
  });
  const { addToast } = useToast();

  const fetchStaff = () => {
    setLoading(true);
    api.get("/users?limit=100&role=STAFF")
      .then(({ data }) => setStaff(data.data))
      .catch(() => addToast("Failed to load staff", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", form);
      setShowForm(false);
      setForm({ firstName: "", lastName: "", email: "", password: "", phone: "", role: "STAFF" });
      addToast("Staff member created", "success");
      fetchStaff();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create staff member", "error");
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { isActive: !user.isActive });
      addToast(`${user.isActive ? "Deactivated" : "Activated"} ${user.firstName} ${user.lastName}`, "success");
      fetchStaff();
    } catch { addToast("Failed to update", "error"); }
  };

  if (loading) return <AdminLayout><div className="spinner" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-section-header">
        <h1>Manage Staff</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Staff"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Register New Staff Member</h2>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone (optional)</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Create Staff Member</button>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Company ID</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.firstName} {u.lastName}</strong></td>
                <td>{u.email}</td>
                <td>{u.companyId || "-"}</td>
                <td>{u.phone || "-"}</td>
                <td><span className="badge badge-available">{u.role}</span></td>
                <td><span className={`status ${u.isActive ? "status-active" : "status-cancelled"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className={`btn btn-sm ${u.isActive ? "btn-danger" : "btn-success"}`} onClick={() => toggleActive(u)}>
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>No staff members found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
