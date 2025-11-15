import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../css/Admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

