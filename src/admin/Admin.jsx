// src/admin/Admin.jsx
import { Link } from "react-router-dom";
import DashboardCards from "./components/DashboardCards";
import "./css/Admin.css";

export default function Admin() {
  return (
    <div className="admin-page-content">
      <header className="page-header-section">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening in your hostel today.</p>
        </div>
      </header>

      <DashboardCards />

      <section className="quick-access-section">
        <h2>Quick Access</h2>
        <div className="quick-access-grid">
          <Link to="/admin/students" className="quick-access-card">
            <div className="card-icon">👥</div>
            <div className="card-content">
              <h3>Students</h3>
              <p>Manage student profiles and information</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/admin/rooms" className="quick-access-card">
            <div className="card-icon">🏠</div>
            <div className="card-content">
              <h3>Rooms</h3>
              <p>View and manage hostel rooms</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/admin/attendance" className="quick-access-card">
            <div className="card-icon">✓</div>
            <div className="card-content">
              <h3>Attendance</h3>
              <p>Mark and track student attendance</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/admin/fees" className="quick-access-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Fees</h3>
              <p>Manage fee payments and records</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/admin/leaves" className="quick-access-card">
            <div className="card-icon">📝</div>
            <div className="card-content">
              <h3>Leave Requests</h3>
              <p>Approve or reject leave applications</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/admin/complaints" className="quick-access-card">
            <div className="card-icon">📢</div>
            <div className="card-content">
              <h3>Complaints</h3>
              <p>View and resolve student complaints</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/admin/maintenance" className="quick-access-card">
            <div className="card-icon">🔧</div>
            <div className="card-content">
              <h3>Maintenance</h3>
              <p>Track maintenance requests</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/admin/mess-menu" className="quick-access-card">
            <div className="card-icon">🍽️</div>
            <div className="card-content">
              <h3>Mess Menu</h3>
              <p>Update weekly mess menu</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/admin/analytics" className="quick-access-card">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h3>Analytics</h3>
              <p>View detailed statistics and insights</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
        </div>
      </section>
    </div>
  );
}