import { useState, useEffect } from "react";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = (p) => {
    setLoading(true);
    api.get(`/audit-logs?page=${p}&limit=50`)
      .then(({ data }) => {
        setLogs(data.data);
        setTotalPages(data.pagination.totalPages);
        setPage(data.pagination.page);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(page); }, [page]);

  const getActionBadge = (action) => {
    if (action.includes("CREATE")) return "status-active";
    if (action.includes("UPDATE") || action.includes("GENERATE")) return "status-confirmed";
    if (action.includes("DELETE") || action.includes("DEACTIVATE") || action.includes("REFUND") || action.includes("CANCEL")) return "status-cancelled";
    return "status-pending";
  };

  if (loading) return <AdminLayout><div className="spinner" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-section-header">
        <h1>Audit Logs</h1>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Timestamp</th><th>Admin</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td style={{ whiteSpace: "nowrap" }}>{new Date(l.createdAt).toLocaleString()}</td>
                <td>{l.user?.firstName} {l.user?.lastName}<br /><small>{l.user?.email}</small></td>
                <td><span className={`status ${getActionBadge(l.action)}`}>{l.action}</span></td>
                <td>{l.entity}{l.entityId ? ` #${l.entityId.slice(0, 8)}` : ""}</td>
                <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.details || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </AdminLayout>
  );
}
