import { useState, useEffect } from "react";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";

export default function WeeklyReports() {
  const [activeTab, setActiveTab] = useState("weekly");
  const [report, setReport] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateReport = async (type) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/${type}`);
      setReport(data.data);
      setGenerated(true);
    } catch (err) {
      console.error("Error generating report:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    api.get("/reports/revenue?days=30")
      .then(({ data }) => setRevenueData(data.data))
      .catch(() => {});
  }, []);

  // Load weekly report by default
  useEffect(() => {
    generateReport("weekly");
  }, []);

  const totalRevenue = revenueData?.data?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const paymentsByMethod = revenueData?.data?.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + p.amount;
    return acc;
  }, {}) || {};

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    generateReport(tab);
  };

  return (
    <AdminLayout>
      <div className="admin-section-header">
        <h1>Reports</h1>
        <button className="btn btn-primary" onClick={() => generateReport(activeTab)} disabled={loading}>
          {loading ? "Generating..." : generated ? "Regenerate Report" : "Generate Report"}
        </button>
      </div>

      {/* Report Type Tabs */}
      <div style={{ marginBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: "1rem", paddingBottom: "0.5rem" }}>
          <button
            onClick={() => handleTabChange("daily")}
            style={{
              padding: "0.75rem 1rem",
              background: activeTab === "daily" ? "var(--primary)" : "transparent",
              color: activeTab === "daily" ? "white" : "var(--text)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: activeTab === "daily" ? "bold" : "normal",
            }}
          >
            Daily Report
          </button>
          <button
            onClick={() => handleTabChange("weekly")}
            style={{
              padding: "0.75rem 1rem",
              background: activeTab === "weekly" ? "var(--primary)" : "transparent",
              color: activeTab === "weekly" ? "white" : "var(--text)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: activeTab === "weekly" ? "bold" : "normal",
            }}
          >
            Weekly Report
          </button>
          <button
            onClick={() => handleTabChange("monthly")}
            style={{
              padding: "0.75rem 1rem",
              background: activeTab === "monthly" ? "var(--primary)" : "transparent",
              color: activeTab === "monthly" ? "white" : "var(--text)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: activeTab === "monthly" ? "bold" : "normal",
            }}
          >
            Monthly Report
          </button>
        </div>
      </div>

      {report && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Summary</h2>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            {new Date(report.period.from).toLocaleDateString()} - {new Date(report.period.to).toLocaleDateString()}
            <span style={{ marginLeft: "1rem" }}>Generated: {new Date(report.generatedAt).toLocaleString()}</span>
          </p>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{report.newBookings}</div>
              <div className="stat-label">New Bookings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{report.completedRentals}</div>
              <div className="stat-label">Completed Rentals</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">${report.revenue.toLocaleString()}</div>
              <div className="stat-label">Revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{report.newCustomers}</div>
              <div className="stat-label">New Customers</div>
            </div>
            {report.maintenanceCosts !== undefined && (
              <div className="stat-card">
                <div className="stat-value">${report.maintenanceCosts.toLocaleString()}</div>
                <div className="stat-label">Maintenance Costs</div>
              </div>
            )}
          </div>

          <div className="form-row" style={{ marginTop: "1rem" }}>
            <div className="card">
              <h3>Cars by Category</h3>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {report.carsByCategory.map((c) => (
                    <tr key={c.category}>
                      <td>{c.category}</td>
                      <td>{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card">
              <h3>Payment Methods</h3>
              <table>
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Transactions</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {report.paymentMethods.map((p) => (
                    <tr key={p.method}>
                      <td>{p.method}</td>
                      <td>{p.count}</td>
                      <td>${p.total?.toLocaleString() || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Revenue Overview (Last 30 Days)</h2>
        <div className="stats-grid" style={{ marginTop: "1rem" }}>
          <div className="stat-card">
            <div className="stat-value">${totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{revenueData?.data?.length || 0}</div>
            <div className="stat-label">Transactions</div>
          </div>
          {Object.entries(paymentsByMethod).map(([method, amount]) => (
            <div key={method} className="stat-card">
              <div className="stat-value">${amount.toLocaleString()}</div>
              <div className="stat-label">{method}</div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
