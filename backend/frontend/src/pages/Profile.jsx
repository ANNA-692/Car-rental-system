import { useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Profile() {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ firstName: user?.firstName || "", lastName: user?.lastName || "", phone: user?.phone || "", address: user?.address || "", driverLicense: user?.driverLicense || "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch("/auth/profile", form);
      setUser(data.data);
      addToast("Profile updated", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Update failed", "error");
    }
    setSaving(false);
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: "600px" }}>
        <h1>Profile</h1>
        <div className="card">
          <form onSubmit={handleSubmit}>
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
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Driver License</label>
              <input value={form.driverLicense} onChange={(e) => setForm({ ...form, driverLicense: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Update Profile"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
