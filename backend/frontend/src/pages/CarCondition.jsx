import { useState, useEffect } from "react";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";

export default function CarCondition() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState("");
  const [images, setImages] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [baselineId, setBaselineId] = useState("");
  const [comparisonId, setComparisonId] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get("/cars?limit=100")
      .then(({ data }) => setCars(data.data.filter((c) => c.isActive)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCar) { setImages([]); setReports([]); return; }
    setError("");
    Promise.all([
      api.get(`/condition/${selectedCar}/images`),
      api.get(`/condition/${selectedCar}/reports`),
    ])
      .then(([imgRes, repRes]) => {
        setImages(imgRes.data.data);
        setReports(repRes.data.data);
      })
      .catch(() => setError("Failed to load car data"))
      .finally(() => setLoading(false));
  }, [selectedCar]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.image.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");
    const formData = new FormData();
    formData.append("image", file);
    if (label) formData.append("label", label);
    try {
      const { data } = await api.post(`/condition/${selectedCar}/images`, formData);
      setImages([data.data, ...images]);
      setSuccess("Image uploaded successfully");
      setLabel("");
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCompare = async () => {
    if (!baselineId || !comparisonId) return;
    setComparing(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post(`/condition/${selectedCar}/compare`, {
        baselineImageId: baselineId,
        comparisonImageId: comparisonId,
      });
      setReports([data.data, ...reports]);
      setSuccess("Comparison complete");
    } catch (err) {
      setError(err.response?.data?.message || "Comparison failed");
    } finally {
      setComparing(false);
    }
  };

  const handleReview = async (reportId, status, notes) => {
    try {
      await api.put(`/condition/reports/${reportId}/review`, { status, notes });
      setReports(reports.map((r) => r.id === reportId ? { ...r, status, notes, reviewedAt: new Date().toISOString() } : r));
    } catch {}
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm("Delete this image?")) return;
    try {
      await api.delete(`/condition/images/${imageId}`);
      setImages(images.filter((i) => i.id !== imageId));
    } catch {}
  };

  if (loading) return <AdminLayout><div className="spinner" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-section-header">
        <h1>Car Condition Inspection</h1>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="form-group">
          <label>Select Car</label>
          <select value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)}>
            <option value="">-- Choose a car --</option>
            {cars.map((c) => (
              <option key={c.id} value={c.id}>{c.make} {c.model} ({c.year}) - {c.licensePlate}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {selectedCar && (
        <>
          <div className="admin-section-header">
            <h2>Upload Condition Image</h2>
          </div>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <form onSubmit={handleUpload}>
              <div className="form-row">
                <div className="form-group">
                  <label>Image</label>
                  <input type="file" name="image" accept="image/*" required />
                </div>
                <div className="form-group">
                  <label>Label (e.g. Front, Rear, Driver Side)</label>
                  <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Front view" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            </form>
          </div>

          <div className="admin-section-header">
            <h2>Compare Images</h2>
          </div>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            {images.length < 2 ? (
              <p style={{ color: "#666" }}>Upload at least 2 images to run a comparison.</p>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Baseline Image (before)</label>
                    <select value={baselineId} onChange={(e) => setBaselineId(e.target.value)}>
                      <option value="">-- Select --</option>
                      {images.map((img) => (
                        <option key={img.id} value={img.id}>
                          {img.label || "No label"} ({new Date(img.createdAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Comparison Image (after)</label>
                    <select value={comparisonId} onChange={(e) => setComparisonId(e.target.value)}>
                      <option value="">-- Select --</option>
                      {images.map((img) => (
                        <option key={img.id} value={img.id}>
                          {img.label || "No label"} ({new Date(img.createdAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleCompare} disabled={comparing || !baselineId || !comparisonId}>
                  {comparing ? "Comparing..." : "Run Comparison"}
                </button>
              </>
            )}
          </div>

          <h2>Condition Images</h2>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            {images.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", padding: "1rem" }}>No images uploaded yet.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                {images.map((img) => (
                  <div key={img.id} style={{ border: "1px solid #eee", borderRadius: "8px", overflow: "hidden" }}>
                    <img src={img.imageUrl} alt={img.label || "Car condition"} style={{ width: "100%", height: "150px", objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "0.5rem" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{img.label || "Unlabeled"}</div>
                      <div style={{ fontSize: "0.75rem", color: "#666" }}>{new Date(img.createdAt).toLocaleDateString()}</div>
                      <button className="btn btn-danger btn-sm" style={{ marginTop: "0.3rem", width: "100%" }} onClick={() => handleDeleteImage(img.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h2>Damage Reports</h2>
          <div className="card" style={{ overflowX: "auto" }}>
            {reports.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", padding: "1rem" }}>No damage reports yet. Run a comparison above.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Diff Image</th><th>Damage %</th><th>Damage Areas</th><th>Status</th><th>Notes</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        {r.diffImageUrl ? (
                          <img src={r.diffImageUrl} alt="Diff" style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "4px", cursor: "pointer" }}
                            onClick={() => window.open(r.diffImageUrl, "_blank")} />
                        ) : "-"}
                      </td>
                      <td>{r.damagePercent != null ? `${r.damagePercent}%` : "-"}</td>
                      <td>{r.damageAreas != null ? r.damageAreas : "-"}</td>
                      <td><span className={`status ${r.status === "RESOLVED" ? "status-completed" : r.status === "REVIEWED" ? "status-confirmed" : "status-pending"}`}>{r.status}</span></td>
                      <td>
                        <input
                          defaultValue={r.notes || ""}
                          placeholder="Add notes..."
                          style={{ width: "120px", padding: "0.3rem", fontSize: "0.8rem", border: "1px solid #ddd", borderRadius: "4px" }}
                          onBlur={(e) => handleReview(r.id, r.status, e.target.value)}
                        />
                      </td>
                      <td>
                        {r.status === "PENDING" && (
                          <div style={{ display: "flex", gap: "0.3rem" }}>
                            <button className="btn btn-success btn-sm" onClick={() => handleReview(r.id, "REVIEWED", r.notes)}>Approve</button>
                            <button className="btn btn-primary btn-sm" onClick={() => handleReview(r.id, "RESOLVED", r.notes)}>Resolve</button>
                          </div>
                        )}
                        {r.status === "REVIEWED" && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleReview(r.id, "RESOLVED", r.notes)}>Resolve</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
