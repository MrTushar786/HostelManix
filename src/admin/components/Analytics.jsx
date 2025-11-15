import { useState, useEffect, useMemo } from "react";
import { 
  roomsAPI, 
  feesAPI, 
  complaintsAPI, 
  maintenanceAPI, 
  leavesAPI, 
  attendanceAPI,
  studentsAPI 
} from "../../utils/api";
import { format, subDays } from "date-fns";
import "../../css/Dropdown.css";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    rooms: [],
    fees: [],
    complaints: [],
    maintenance: [],
    leaves: [],
    attendance: [],
    students: []
  });
  const [dateRange, setDateRange] = useState("30"); // days

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        roomsRes,
        feesRes,
        complaintsRes,
        maintenanceRes,
        leavesRes,
        attendanceRes,
        studentsRes
      ] = await Promise.all([
        roomsAPI.getAll(),
        feesAPI.getAll(),
        complaintsAPI.getAll(),
        maintenanceAPI.getAll(),
        leavesAPI.getAll(),
        attendanceAPI.getAll(),
        studentsAPI.getAll()
      ]);

      setData({
        rooms: roomsRes.data || [],
        fees: feesRes.data || [],
        complaints: complaintsRes.data || [],
        maintenance: maintenanceRes.data || [],
        leaves: leavesRes.data || [],
        attendance: attendanceRes.data || [],
        students: studentsRes.data || []
      });
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const days = parseInt(dateRange);
    const startDate = subDays(new Date(), days);
    
    // Room Analytics
    const roomStats = {
      total: data.rooms.length,
      occupied: data.rooms.filter(r => r.status === "occupied").length,
      vacant: data.rooms.filter(r => r.status === "vacant").length,
      maintenance: data.rooms.filter(r => r.status === "maintenance").length,
      occupancyRate: data.rooms.length > 0 
        ? ((data.rooms.filter(r => r.status === "occupied").length / data.rooms.length) * 100).toFixed(1)
        : 0
    };

    // Fee Analytics
    const recentFees = data.fees.filter(f => new Date(f.dueDate) >= startDate);
    const feeStats = {
      total: data.fees.length,
      paid: data.fees.filter(f => f.status === "paid").length,
      pending: data.fees.filter(f => f.status === "pending").length,
      overdue: data.fees.filter(f => f.status === "overdue").length,
      totalAmount: data.fees.reduce((sum, f) => sum + (f.amount || 0), 0),
      paidAmount: data.fees.filter(f => f.status === "paid").reduce((sum, f) => sum + (f.amount || 0), 0),
      pendingAmount: data.fees.filter(f => f.status === "pending").reduce((sum, f) => sum + (f.amount || 0), 0),
      overdueAmount: data.fees.filter(f => f.status === "overdue").reduce((sum, f) => sum + (f.amount || 0), 0)
    };

    // Attendance Analytics
    const recentAttendance = data.attendance.filter(a => new Date(a.date) >= startDate);
    const attendanceStats = {
      totalRecords: recentAttendance.length,
      present: recentAttendance.filter(a => a.status === "present").length,
      absent: recentAttendance.filter(a => a.status === "absent").length,
      late: recentAttendance.filter(a => a.status === "late").length,
      attendanceRate: recentAttendance.length > 0
        ? ((recentAttendance.filter(a => a.status === "present").length / recentAttendance.length) * 100).toFixed(1)
        : 0
    };

    // Daily attendance trend
    const dailyAttendance = {};
    recentAttendance.forEach(record => {
      const dateKey = format(new Date(record.date), "yyyy-MM-dd");
      if (!dailyAttendance[dateKey]) {
        dailyAttendance[dateKey] = { present: 0, absent: 0, late: 0, total: 0 };
      }
      dailyAttendance[dateKey][record.status]++;
      dailyAttendance[dateKey].total++;
    });

    // Complaint Analytics
    const recentComplaints = data.complaints.filter(c => new Date(c.createdAt) >= startDate);
    const complaintStats = {
      total: data.complaints.length,
      open: data.complaints.filter(c => c.status !== "resolved").length,
      resolved: data.complaints.filter(c => c.status === "resolved").length,
      recent: recentComplaints.length
    };

    // Maintenance Analytics
    const recentMaintenance = data.maintenance.filter(m => new Date(m.createdAt) >= startDate);
    const maintenanceStats = {
      total: data.maintenance.length,
      open: data.maintenance.filter(m => m.status !== "resolved").length,
      resolved: data.maintenance.filter(m => m.status === "resolved").length,
      recent: recentMaintenance.length
    };

    // Leave Analytics
    const recentLeaves = data.leaves.filter(l => new Date(l.createdAt) >= startDate);
    const leaveStats = {
      total: data.leaves.length,
      pending: data.leaves.filter(l => l.status === "Pending").length,
      approved: data.leaves.filter(l => l.status === "Approved").length,
      rejected: data.leaves.filter(l => l.status === "Rejected").length,
      recent: recentLeaves.length
    };

    // Student Analytics
    const studentStats = {
      total: data.students.length,
      byYear: {
        "1st Year": data.students.filter(s => s.year === "1st Year").length,
        "2nd Year": data.students.filter(s => s.year === "2nd Year").length,
        "3rd Year": data.students.filter(s => s.year === "3rd Year").length,
        "4th Year": data.students.filter(s => s.year === "4th Year").length,
        "Other": data.students.filter(s => !s.year || !["1st Year", "2nd Year", "3rd Year", "4th Year"].includes(s.year)).length
      }
    };

    return {
      roomStats,
      feeStats,
      attendanceStats,
      complaintStats,
      maintenanceStats,
      leaveStats,
      studentStats,
      dailyAttendance
    };
  }, [data, dateRange]);

  if (loading) {
    return <div className="admin-page"><p>Loading analytics...</p></div>;
  }

  return (
    <div className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <h2>Detailed Analytics</h2>
        <select
          className="styled-select"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          style={{ padding: "8px 12px", minWidth: "150px" }}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Room Analytics */}
      <div style={{ 
        background: "rgba(255,255,255,0.12)", 
        border: "1px solid rgba(255,255,255,0.25)", 
        borderRadius: "16px", 
        padding: "24px",
        marginBottom: "24px"
      }}>
        <h3 style={{ marginBottom: "20px", color: "#60a5fa" }}>Room Analytics</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "16px", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.9rem", color: "#93c5fd", marginBottom: "8px" }}>Total Rooms</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#fff" }}>{analytics.roomStats.total}</div>
          </div>
          <div style={{ background: "rgba(34,197,94,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid #22c55e" }}>
            <div style={{ fontSize: "0.9rem", color: "#86efac", marginBottom: "8px" }}>Occupied</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#86efac" }}>{analytics.roomStats.occupied}</div>
          </div>
          <div style={{ background: "rgba(239,68,68,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid #ef4444" }}>
            <div style={{ fontSize: "0.9rem", color: "#fca5a5", marginBottom: "8px" }}>Vacant</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#fca5a5" }}>{analytics.roomStats.vacant}</div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid #f59e0b" }}>
            <div style={{ fontSize: "0.9rem", color: "#fcd34d", marginBottom: "8px" }}>Maintenance</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#fcd34d" }}>{analytics.roomStats.maintenance}</div>
          </div>
          <div style={{ background: "rgba(96,165,250,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid #60a5fa" }}>
            <div style={{ fontSize: "0.9rem", color: "#93c5fd", marginBottom: "8px" }}>Occupancy Rate</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#60a5fa" }}>{analytics.roomStats.occupancyRate}%</div>
          </div>
        </div>
      </div>

      {/* Fee Analytics */}
      <div style={{ 
        background: "rgba(255,255,255,0.12)", 
        border: "1px solid rgba(255,255,255,0.25)", 
        borderRadius: "16px", 
        padding: "24px",
        marginBottom: "24px"
      }}>
        <h3 style={{ marginBottom: "20px", color: "#60a5fa" }}>Fee Analytics</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          <div style={{ background: "rgba(34,197,94,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid #22c55e" }}>
            <div style={{ fontSize: "0.9rem", color: "#86efac", marginBottom: "8px" }}>Paid</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#86efac" }}>{analytics.feeStats.paid}</div>
            <div style={{ fontSize: "0.85rem", color: "#86efac", marginTop: "4px" }}>₹{analytics.feeStats.paidAmount.toLocaleString()}</div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid #f59e0b" }}>
            <div style={{ fontSize: "0.9rem", color: "#fcd34d", marginBottom: "8px" }}>Pending</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#fcd34d" }}>{analytics.feeStats.pending}</div>
            <div style={{ fontSize: "0.85rem", color: "#fcd34d", marginTop: "4px" }}>₹{analytics.feeStats.pendingAmount.toLocaleString()}</div>
          </div>
          <div style={{ background: "rgba(239,68,68,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid #ef4444" }}>
            <div style={{ fontSize: "0.9rem", color: "#fca5a5", marginBottom: "8px" }}>Overdue</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#fca5a5" }}>{analytics.feeStats.overdue}</div>
            <div style={{ fontSize: "0.85rem", color: "#fca5a5", marginTop: "4px" }}>₹{analytics.feeStats.overdueAmount.toLocaleString()}</div>
          </div>
          <div style={{ background: "rgba(96,165,250,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid #60a5fa" }}>
            <div style={{ fontSize: "0.9rem", color: "#93c5fd", marginBottom: "8px" }}>Total Amount</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#60a5fa" }}>₹{analytics.feeStats.totalAmount.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Attendance Analytics */}
      <div style={{ 
        background: "rgba(255,255,255,0.12)", 
        border: "1px solid rgba(255,255,255,0.25)", 
        borderRadius: "16px", 
        padding: "24px",
        marginBottom: "24px"
      }}>
        <h3 style={{ marginBottom: "20px", color: "#60a5fa" }}>Attendance Analytics (Last {dateRange} days)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          <div style={{ background: "rgba(34,197,94,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid #22c55e" }}>
            <div style={{ fontSize: "0.9rem", color: "#86efac", marginBottom: "8px" }}>Present</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#86efac" }}>{analytics.attendanceStats.present}</div>
          </div>
          <div style={{ background: "rgba(239,68,68,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid #ef4444" }}>
            <div style={{ fontSize: "0.9rem", color: "#fca5a5", marginBottom: "8px" }}>Absent</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#fca5a5" }}>{analytics.attendanceStats.absent}</div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid #f59e0b" }}>
            <div style={{ fontSize: "0.9rem", color: "#fcd34d", marginBottom: "8px" }}>Late</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#fcd34d" }}>{analytics.attendanceStats.late}</div>
          </div>
          <div style={{ background: "rgba(96,165,250,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid #60a5fa" }}>
            <div style={{ fontSize: "0.9rem", color: "#93c5fd", marginBottom: "8px" }}>Attendance Rate</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#60a5fa" }}>{analytics.attendanceStats.attendanceRate}%</div>
          </div>
        </div>
      </div>

      {/* Student Analytics */}
      <div style={{ 
        background: "rgba(255,255,255,0.12)", 
        border: "1px solid rgba(255,255,255,0.25)", 
        borderRadius: "16px", 
        padding: "24px",
        marginBottom: "24px"
      }}>
        <h3 style={{ marginBottom: "20px", color: "#60a5fa" }}>Student Analytics</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
          <div style={{ background: "rgba(96,165,250,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid #60a5fa" }}>
            <div style={{ fontSize: "0.9rem", color: "#93c5fd", marginBottom: "8px" }}>Total Students</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#60a5fa" }}>{analytics.studentStats.total}</div>
          </div>
          {Object.entries(analytics.studentStats.byYear).map(([year, count]) => (
            <div key={year} style={{ background: "rgba(255,255,255,0.1)", padding: "16px", borderRadius: "12px" }}>
              <div style={{ fontSize: "0.9rem", color: "#93c5fd", marginBottom: "8px" }}>{year}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#fff" }}>{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Analytics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        <div style={{ 
          background: "rgba(255,255,255,0.12)", 
          border: "1px solid rgba(255,255,255,0.25)", 
          borderRadius: "16px", 
          padding: "24px"
        }}>
          <h3 style={{ marginBottom: "16px", color: "#60a5fa", fontSize: "1.2rem" }}>Complaints</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#93c5fd" }}>Total:</span>
              <span style={{ color: "#fff", fontWeight: "600" }}>{analytics.complaintStats.total}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#fca5a5" }}>Open:</span>
              <span style={{ color: "#fca5a5", fontWeight: "600" }}>{analytics.complaintStats.open}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86efac" }}>Resolved:</span>
              <span style={{ color: "#86efac", fontWeight: "600" }}>{analytics.complaintStats.resolved}</span>
            </div>
          </div>
        </div>

        <div style={{ 
          background: "rgba(255,255,255,0.12)", 
          border: "1px solid rgba(255,255,255,0.25)", 
          borderRadius: "16px", 
          padding: "24px"
        }}>
          <h3 style={{ marginBottom: "16px", color: "#60a5fa", fontSize: "1.2rem" }}>Maintenance</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#93c5fd" }}>Total:</span>
              <span style={{ color: "#fff", fontWeight: "600" }}>{analytics.maintenanceStats.total}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#fca5a5" }}>Open:</span>
              <span style={{ color: "#fca5a5", fontWeight: "600" }}>{analytics.maintenanceStats.open}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86efac" }}>Resolved:</span>
              <span style={{ color: "#86efac", fontWeight: "600" }}>{analytics.maintenanceStats.resolved}</span>
            </div>
          </div>
        </div>

        <div style={{ 
          background: "rgba(255,255,255,0.12)", 
          border: "1px solid rgba(255,255,255,0.25)", 
          borderRadius: "16px", 
          padding: "24px"
        }}>
          <h3 style={{ marginBottom: "16px", color: "#60a5fa", fontSize: "1.2rem" }}>Leave Requests</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#93c5fd" }}>Total:</span>
              <span style={{ color: "#fff", fontWeight: "600" }}>{analytics.leaveStats.total}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#fcd34d" }}>Pending:</span>
              <span style={{ color: "#fcd34d", fontWeight: "600" }}>{analytics.leaveStats.pending}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86efac" }}>Approved:</span>
              <span style={{ color: "#86efac", fontWeight: "600" }}>{analytics.leaveStats.approved}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#fca5a5" }}>Rejected:</span>
              <span style={{ color: "#fca5a5", fontWeight: "600" }}>{analytics.leaveStats.rejected}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

