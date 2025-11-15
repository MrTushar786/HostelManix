import Navbar from "../component/Navbar";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Link } from "react-router-dom";
import "../css/Student.css";
import { attendanceAPI } from "../utils/api";

export default function Student() {
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0, rate: 0 });
  
  useEffect(() => {
    (async () => {
      try {
        const studentId = sessionStorage.getItem('studentId');
        if (studentId) {
          const res = await attendanceAPI.getStats(studentId);
          setStats(res.data);
        }
      } catch {}
    })();
  }, []);
  
  const data = [
    { name: "Present", value: stats.present },
    { name: "Absent", value: stats.absent + stats.late }
  ];

  const COLORS = ["#2563EB", "#E5E7EB"];

  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <h1>HostelManix</h1>
        <p>Welcome, Student 👋</p>
      </header>

      <section className="dashboard-main">
        {/* Left: Chart */}
        <div className="chart-section">
          <h2>Attendance Overview</h2>
          <PieChart width={250} height={250}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
          <div style={{ marginTop: 8, color: '#ffffff' }}>
            <span>Present: {stats.present} • Absent: {stats.absent} • Late: {stats.late} • Rate: {stats.rate}%</span>
          </div>
        </div>

        {/* Right: Options */}
        <div className="action-section">
          <h2>Quick Actions</h2>
          <div className="card-grid">
            <Link to="/roominfo" className="card">🏠Room Info</Link>
            <Link to="/messmenu" className="card">🍽 Mess Menu</Link>
            <Link to="/feestatus" className="card">💰 Fee Status</Link>
            <Link to="/leave" className="card">📝 Leave Application</Link>
            <Link to="/complaint" className="card">📢 Complaint</Link>
            <Link to="/maintenancerequest" className="card">🧹 Maintenance Request</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
