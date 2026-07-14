import { useState, useEffect } from "react";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../context/ToastContext";

export default function ManageCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addToast } = useToast();

  const fetchUsers = (query) => {
    setLoading(true);
    const s = query ?? search;
    api.get(`/users?limit=100&role=CUSTOMER${s ? `&search=${s}` : ""}`)
      .then(({ data }) => setUsers(data.data))
      .catch(() => addToast("Failed to load customers", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(""); }, []);

  const toggleActive = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { isActive: !user.isActive });
      addToast(`${user.isActive ? "Deactivated" : "Activated"} ${user.firstName} ${user.lastName}`, "success");
      fetchUsers();
    } catch { addToast("Failed to update", "error"); }
  };

  if (loading) return <AdminLayout><div className="spinner" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-section-header">
        <h1>Manage Customers</h1>
        <input
          className="search-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchUsers(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Invoice</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.phone || "-"}</td>
                <td>{u.invoiceImage ? <a href={u.invoiceImage} target="_blank" rel="noopener noreferrer">View</a> : "-"}</td>
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
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
