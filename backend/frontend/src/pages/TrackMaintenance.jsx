import { useState, useEffect } from "react";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";

export default function TrackMaintenance() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ carId: "", description: "", type: "REPAIR", cost: "", scheduledAt: "", notes: "", status: "PENDING", invoiceImage: null });
  const [cars, setCars] = useState([]);

  const fetchData = () => {
    Promise.all([
      api.get("/maintenance?limit=100"),
      api.get("/cars?limit=100"),
    ]).then(([logsRes, carsRes]) => {
      setLogs(logsRes.data.data);
      setCars(carsRes.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ carId: "", description: "", type: "REPAIR", cost: "", scheduledAt: "", notes: "", status: "PENDING", invoiceImage: null });
    setShowForm(false);
    setEditItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("carId", form.carId);
      formData.append("description", form.description);
      formData.append("type", form.type);
      formData.append("cost", Number(form.cost));
      if (form.scheduledAt) formData.append("scheduledAt", form.scheduledAt);
      if (form.notes) formData.append("notes", form.notes);
      formData.append("status", form.status);
      if (form.invoiceImage) {
        formData.append("invoiceImage", form.invoiceImage);
      }
      if (editItem) {
        const { data } = await api.put(`/maintenance/${editItem.id}`, formData);
        setLogs(logs.map((l) => l.id === editItem.id ? data.data : l));
      } else {
        const { data } = await api.post("/maintenance", formData);
        setLogs([data.data, ...logs]);
      }
      resetForm();
    } catch {}
  };

  const deleteLog = async (id) => {
    if (!confirm("Delete this maintenance log?")) return;
    try {
      await api.delete(`/maintenance/${id}`);
      setLogs(logs.filter((l) => l.id !== id));
    } catch {}
  };

  const editLog = (log) => {
    setEditItem(log);
    setForm({
      carId: log.carId,
      description: log.description,
      type: log.type,
      cost: log.cost,
      scheduledAt: log.scheduledAt ? log.scheduledAt.slice(0, 16) : "",
      notes: log.notes || "",
      status: log.status,
      invoiceImage: null,
    });
    setShowForm(true);
  };

  if (loading) return <AdminLayout><div className="spinner" /></AdminLayout>;

  const statusClass = { PENDING: "status-pending", IN_PROGRESS: "status-confirmed", COMPLETED: "status-completed", CANCELLED: "status-cancelled" };

  return (
    <AdminLayout>
      <div className="admin-section-header">
        <h1>Vehicle Maintenance</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? "Cancel" : "+ New Record"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h2>{editItem ? "Edit Maintenance" : "New Maintenance Record"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Vehicle</label><select value={form.carId} onChange={(e) => setForm({ ...form, carId: e.target.value })} required>
                <option value="">Select car...</option>
                {cars.filter((c) => c.isActive).map((c) => (
                  <option key={c.id} value={c.id}>{c.make} {c.model} - {c.licensePlate}</option>
                ))}
              </select></div>
              <div className="form-group"><label>Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="REPAIR">Repair</option><option value="SERVICE">Service</option><option value="INSPECTION">Inspection</option><option value="OTHER">Other</option>
              </select></div>
            </div>
            <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows="2" /></div>
            <div className="form-row">
              <div className="form-group"><label>Cost ($)</label><input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required /></div>
              <div className="form-group"><label>Scheduled Date</label><input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="PENDING">Pending</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option>
              </select></div>
              <div className="form-group"><label>Notes</label><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Invoice Image</label><input type="file" accept="image/*" onChange={(e) => setForm({ ...form, invoiceImage: e.target.files[0] })} required={!editItem} /></div>
            <button type="submit" className="btn btn-primary">{editItem ? "Update" : "Create"}</button>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Vehicle</th><th>Type</th><th>Description</th><th>Cost</th><th>Invoice</th><th>Scheduled</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{l.car?.make} {l.car?.model}<br /><small>{l.car?.licensePlate}</small></td>
                <td>{l.type}</td>
                <td>{l.description}</td>
                <td>${l.cost}</td>
                <td>{l.invoiceImage ? <a href={l.invoiceImage} target="_blank" rel="noopener noreferrer">View</a> : "-"}</td>
                <td>{l.scheduledAt ? new Date(l.scheduledAt).toLocaleDateString() : "-"}</td>
                <td><span className={`status ${statusClass[l.status] || ""}`}>{l.status}</span></td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => editLog(l)}>Edit</button>
                  <button className="btn btn-danger btn-sm" style={{ marginLeft: "0.3rem" }} onClick={() => deleteLog(l.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
