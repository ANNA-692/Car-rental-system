import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const allSidebarLinks = [
  { to: "/admin", label: "Dashboard", icon: "📊", adminOnly: false },
  { to: "/admin/vehicles", label: "Manage Vehicles", icon: "🚗", adminOnly: false },
  { to: "/admin/customers", label: "Manage Customers", icon: "👥", adminOnly: false },
  { to: "/admin/staff", label: "Manage Staff", icon: "🧑‍💼", adminOnly: true },
  { to: "/admin/reservations", label: "Reservations", icon: "📅", adminOnly: false },
  { to: "/admin/rentals", label: "Rentals", icon: "🔑", adminOnly: false },
  { to: "/admin/tracking", label: "Car Tracking", icon: "📍", adminOnly: false },
  { to: "/admin/payments", label: "Payments", icon: "💰", adminOnly: false },
  { to: "/admin/maintenance", label: "Maintenance", icon: "🔧", adminOnly: false },
  { to: "/admin/condition", label: "Car Condition", icon: "📷", adminOnly: false },
  { to: "/admin/reports", label: "Weekly Reports", icon: "📈", adminOnly: false },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: "📋", adminOnly: false },
];

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const sidebarLinks = allSidebarLinks.filter((l) => !l.adminOnly || user?.role === "ADMIN");

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">Admin Panel</div>
        <nav className="admin-sidebar-nav">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/admin"}
              className={({ isActive }) => `admin-sidebar-link ${isActive ? "active" : ""}`}
            >
              <span className="admin-sidebar-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
