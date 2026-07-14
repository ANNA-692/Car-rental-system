import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../api/client";
import { Link } from "react-router-dom";

export default function Settings() {
  const { dark, toggleDark } = useTheme();
  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  const [staffForm, setStaffForm] = useState({
    firstName: "", lastName: "", email: "", password: "", phone: "", role: "STAFF",
  });

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", staffForm);
      addToast("Staff member created successfully", "success");
      setStaffForm({ firstName: "", lastName: "", email: "", password: "", phone: "", role: "STAFF" });
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create staff member", "error");
    }
  };

  const defaultPrefs = {
    emailNotifications: true,
    smsNotifications: false,
    defaultRentalDays: 3,
    preferredPayment: "credit_card",
    language: "en",
  };

  const savedPrefs = (() => {
    try { return JSON.parse(localStorage.getItem("preferences")) || defaultPrefs; }
    catch { return defaultPrefs; }
  })();

  const [prefs, setPrefs] = useState(savedPrefs);

  const savePrefs = (updated) => {
    setPrefs(updated);
    localStorage.setItem("preferences", JSON.stringify(updated));
    addToast("Preferences saved", "success");
  };

  const togglePref = (key) => {
    savePrefs({ ...prefs, [key]: !prefs[key] });
  };

  const updatePref = (key, value) => {
    savePrefs({ ...prefs, [key]: value });
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: "700px" }}>
        <h1>Settings</h1>

        <div className="card">
          <div className="settings-group">
            <h3>Appearance</h3>
            <div className="setting-row">
              <div>
                <div className="setting-label">Dark Mode</div>
                <div className="setting-desc">Switch between light and dark theme</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={dark} onChange={toggleDark} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="section-divider" />

          <div className="settings-group">
            <h3>Notifications</h3>
            <div className="setting-row">
              <div>
                <div className="setting-label">Email Notifications</div>
                <div className="setting-desc">Receive booking confirmations and updates via email</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={prefs.emailNotifications} onChange={() => togglePref("emailNotifications")} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">SMS Notifications</div>
                <div className="setting-desc">Receive text alerts for rental reminders</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={prefs.smsNotifications} onChange={() => togglePref("smsNotifications")} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="section-divider" />

          <div className="settings-group">
            <h3>Booking Preferences</h3>
            <div className="setting-row">
              <div>
                <div className="setting-label">Default Rental Duration</div>
                <div className="setting-desc">Pre-selected number of days when booking</div>
              </div>
              <select value={prefs.defaultRentalDays} onChange={(e) => updatePref("defaultRentalDays", parseInt(e.target.value))} style={{ padding: "0.4rem 0.6rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg)", color: "var(--text)" }}>
                {[1, 2, 3, 5, 7, 14, 30].map((d) => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>)}
              </select>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Preferred Payment</div>
                <div className="setting-desc">Default payment method for new bookings</div>
              </div>
              <select value={prefs.preferredPayment} onChange={(e) => updatePref("preferredPayment", e.target.value)} style={{ padding: "0.4rem 0.6rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg)", color: "var(--text)" }}>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          {user && (
            <>
              <div className="section-divider" />
              <div className="settings-group">
                <h3>Account</h3>
                <div className="setting-row">
                  <div>
                    <div className="setting-label">Language</div>
                    <div className="setting-desc">Interface language preference</div>
                  </div>
                  <select value={prefs.language} onChange={(e) => updatePref("language", e.target.value)} style={{ padding: "0.4rem 0.6rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg)", color: "var(--text)" }}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </>
          )}
          {user?.role === "ADMIN" && (
            <>
              <div className="section-divider" />
              <div className="settings-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0 }}>Staff Management</h3>
                  <Link to="/admin/staff" className="btn btn-outline" style={{ fontSize: "0.85rem" }}>View All Staff</Link>
                </div>
                <form onSubmit={handleAddStaff}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input value={staffForm.firstName} onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input value={staffForm.lastName} onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
                        <option value="STAFF">Staff</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Phone (optional)</label>
                    <input value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-primary">Add Staff Member</button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
