// src/admin/components/DashboardCards.jsx
import { useMemo, useEffect, useState, memo } from "react";
import { roomsAPI, feesAPI, complaintsAPI, maintenanceAPI, leavesAPI } from "../../utils/api";

const DashboardCards = memo(function DashboardCards() {
  const [rooms, setRooms] = useState([]);
  const [fees, setFees] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    loadStats(isMounted);
    return () => { isMounted = false; };
  }, []);

  const loadStats = async (isMounted = true) => {
    try {
      setLoading(true);
      const [roomsRes, feesRes, complaintsRes, maintenanceRes, leavesRes] = await Promise.all([
        roomsAPI.getAll(),
        feesAPI.getAll(),
        complaintsAPI.getAll(),
        maintenanceAPI.getAll(),
        leavesAPI.getAll()
      ]);
      if (isMounted) {
        setRooms(roomsRes.data || []);
        setFees(feesRes.data || []);
        setComplaints(complaintsRes.data || []);
        setMaintenance(maintenanceRes.data || []);
        setLeaves(leavesRes.data || []);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const occupied = rooms.filter(r => r.status === "occupied").length;
    const vacant = rooms.filter(r => r.status === "vacant").length;
    const maint = rooms.filter(r => r.status === "maintenance").length;

    const paid = fees.filter(f => f.status === "paid").length;
    const pending = fees.filter(f => f.status === "pending").length;
    const overdue = fees.filter(f => f.status === "overdue").length;

    const openComp = complaints.filter(c => c.status !== "resolved").length;
    const openMaint = maintenance.filter(r => r.status !== "resolved").length;
    const pendingLeave = leaves.filter(l => l.status === "Pending").length;

    return { occupied, vacant, maint, paid, pending, overdue, openComp, openMaint, pendingLeave };
  }, [rooms, fees, complaints, maintenance, leaves]);

  if (loading) {
    return <div className="stats-grid admin"><div className="stat-card">Loading...</div></div>;
  }

  return (
    <div className="stats-grid admin">
      <div className="stat-card"><strong>{stats.occupied}</strong> Occupied Rooms</div>
      <div className="stat-card"><strong>{stats.vacant}</strong> Vacant Rooms</div>
      <div className="stat-card"><strong>{stats.maint}</strong> Under Maintenance</div>

      <div className="stat-card"><strong>{stats.paid}</strong> Fees Paid</div>
      <div className="stat-card"><strong>{stats.pending}</strong> Fees Pending</div>
      <div className="stat-card"><strong>{stats.overdue}</strong> Fees Overdue</div>

      <div className="stat-card"><strong>{stats.openComp}</strong> Open Complaints</div>
      <div className="stat-card"><strong>{stats.openMaint}</strong> Open Maintenance</div>
      <div className="stat-card"><strong>{stats.pendingLeave}</strong> Pending Leaves</div>
    </div>
  );
});

export default DashboardCards;

