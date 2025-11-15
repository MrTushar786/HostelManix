import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { usersAPI } from "../../utils/api";

export default function Sidebar() {
  const location = useLocation();
  const [userInfo, setUserInfo] = useState({ username: "Admin", photoUrl: "" });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await usersAPI.getMe();
        setUserInfo({
          username: res.data.username || "Admin",
          photoUrl: res.data.photoUrl || ""
        });
      } catch {}
    })();

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("studentId");
    window.location.href = "/";
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/analytics", label: "Analytics", icon: "📈" },
    { path: "/admin/students", label: "Students", icon: "👥" },
    { path: "/admin/rooms", label: "Rooms", icon: "🏠" },
    { path: "/admin/attendance", label: "Attendance", icon: "✓" },
    { path: "/admin/fees", label: "Fees", icon: "💰" },
    { path: "/admin/leaves", label: "Leave Requests", icon: "📝" },
    { path: "/admin/complaints", label: "Complaints", icon: "📢" },
    { path: "/admin/maintenance", label: "Maintenance", icon: "🔧" },
    { path: "/admin/mess-menu", label: "Mess Menu", icon: "🍽️" },
  ];

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <h1>🏢 HostelManix</h1>
          <p>Admin Panel</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer" ref={menuRef}>
        <div
          className="user-profile"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <div className="user-avatar">
            {userInfo.photoUrl ? (
              <img src={userInfo.photoUrl} alt={userInfo.username} />
            ) : (
              <span>{userInfo.username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{userInfo.username}</span>
            <span className="user-role">Administrator</span>
          </div>
          <span className="dropdown-arrow">▼</span>
        </div>
        {showProfileMenu && (
          <div className="profile-menu">
            <Link
              to="/admin/profile"
              className="profile-menu-item"
              onClick={() => setShowProfileMenu(false)}
            >
              <span>⚙️</span> Settings
            </Link>
            <button
              className="profile-menu-item logout"
              onClick={handleLogout}
            >
              <span>🚪</span> Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
