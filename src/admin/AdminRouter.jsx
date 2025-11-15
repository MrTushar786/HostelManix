// src/admin/AdminRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import Admin from "./Admin";
import RoomAdmin from "./components/RoomTable";
import FeeAdmin from "./components/FeeTable";
import ComplaintAdmin from "./components/ComplaintTable";
import MaintenanceAdmin from "./components/MaintenanceTable";
import LeaveAdmin from "./components/LeaveTable";
import AttendanceAdmin from "./components/AttendanceTable";
import StudentAdmin from "./components/StudentTable";
import MessMenuAdmin from "./components/MessMenuTable";
import AdminProfile from "./components/AdminProfile";
import Analytics from "./components/Analytics";

export default function AdminRouter() {
  // Simple auth guard – you can replace with real token check later
  const isAdmin = sessionStorage.getItem("role") === "admin";

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Admin />} />
        <Route path="rooms" element={<RoomAdmin />} />
        <Route path="fees" element={<FeeAdmin />} />
        <Route path="students" element={<StudentAdmin />} />
        <Route path="mess-menu" element={<MessMenuAdmin />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="complaints" element={<ComplaintAdmin />} />
        <Route path="maintenance" element={<MaintenanceAdmin />} />
        <Route path="leaves" element={<LeaveAdmin />} />
        <Route path="attendance" element={<AttendanceAdmin />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}