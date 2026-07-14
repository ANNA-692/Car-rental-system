import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import CarDetail from "./pages/CarDetail";
import CarList from "./pages/CarList";
import CarCompare from "./pages/CarCompare";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import { useAuth } from "./context/AuthContext";

import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import ManageVehicles from "./pages/ManageVehicles";
import ManageCustomers from "./pages/ManageCustomers";
import ManageStaff from "./pages/ManageStaff";
import ManageReservations from "./pages/ManageReservations";
import ManageRentals from "./pages/ManageRentals";
import TrackPayments from "./pages/TrackPayments";
import TrackMaintenance from "./pages/TrackMaintenance";
import CarCondition from "./pages/CarCondition";
import CarTracking from "./pages/CarTracking";
import WeeklyReports from "./pages/WeeklyReports";
import AuditLogs from "./pages/AuditLogs";
import CreateCar from "./pages/CreateCar";
import NotFound from "./pages/NotFound";

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Home Route - Redirects based on login status */}
        <Route path="/" element={
          user ? <Navigate to="/bookings" replace /> : <Navigate to="/cars" replace />
        } />
        
        {/* Public Car Browsing - Accessible to everyone */}
        <Route path="/cars" element={<CarList />} />
        <Route path="/cars/:id" element={<CarDetail />} />
        <Route path="/compare" element={<CarCompare />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Customer Routes */}
        <Route path="/bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/vehicles" element={<PrivateRoute adminOnly><ManageVehicles /></PrivateRoute>} />
        <Route path="/admin/customers" element={<PrivateRoute adminOnly><ManageCustomers /></PrivateRoute>} />
        <Route path="/admin/staff" element={<PrivateRoute adminOnly><ManageStaff /></PrivateRoute>} />
        <Route path="/admin/reservations" element={<PrivateRoute adminOnly><ManageReservations /></PrivateRoute>} />
        <Route path="/admin/rentals" element={<PrivateRoute adminOnly><ManageRentals /></PrivateRoute>} />
        <Route path="/admin/tracking" element={<PrivateRoute adminOnly><CarTracking /></PrivateRoute>} />
        <Route path="/admin/payments" element={<PrivateRoute adminOnly><TrackPayments /></PrivateRoute>} />
        <Route path="/admin/maintenance" element={<PrivateRoute adminOnly><TrackMaintenance /></PrivateRoute>} />
        <Route path="/admin/condition" element={<PrivateRoute adminOnly><CarCondition /></PrivateRoute>} />
        <Route path="/admin/reports" element={<PrivateRoute adminOnly><WeeklyReports /></PrivateRoute>} />
        <Route path="/admin/audit-logs" element={<PrivateRoute adminOnly><AuditLogs /></PrivateRoute>} />
        <Route path="/admin/cars/new" element={<PrivateRoute adminOnly><CreateCar /></PrivateRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}
