import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">Mollash Cars</Link>
        {user && <Link to="/profile" className="profile-link">Profile</Link>}
        <div className="nav-links">
          {user?.role !== "ADMIN" && <Link to="/cars">Cars</Link>}
          {user ? (
            <>
              {user.role === "ADMIN" && <Link to="/admin">Dashboard</Link>}
              <Link to="/bookings">My Bookings</Link>
              <Link to="/settings">Settings</Link>
              <Link to="/" className="btn-nav" onClick={logout}>Logout</Link>
            </>
          ) : (
            <Link to="/login" className="btn-nav">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
