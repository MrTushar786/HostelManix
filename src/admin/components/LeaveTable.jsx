import { useState, useEffect, useMemo } from "react";
import { leavesAPI } from "../../utils/api";
import { showConfirm, showError, showSuccess } from "../../components/DialogProvider";
import { showNotification } from "../../components/Notification";
import Pagination from "./Pagination";
import "../../css/Dropdown.css";

export default function LeaveAdmin() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const response = await leavesAPI.getAll();
      setLeaves(response.data || []);
    } catch (error) {
      console.error("Error loading leaves:", error);
      showError("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, reviewNotes = "") => {
    try {
      await leavesAPI.update(id, { status, reviewNotes });
      showSuccess(`Leave request ${status === "Approved" ? "approved" : "rejected"} successfully`);
      loadLeaves();
      setSelectedLeave(null);
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update leave request");
    }
  };

  const handleApprove = (leave) => {
    showConfirm(
      `Approve leave request for ${leave.studentId?.name || leave.name}?`,
      () => handleStatusUpdate(leave._id, "Approved"),
      "Approve Leave Request"
    );
  };

  const handleReject = (leave) => {
    showConfirm(
      `Reject leave request for ${leave.studentId?.name || leave.name}?`,
      () => handleStatusUpdate(leave._id, "Rejected"),
      "Reject Leave Request"
    );
  };

  const filteredLeaves = useMemo(() => {
    let filtered = leaves;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(l => 
        l.studentId?.name?.toLowerCase().includes(term) ||
        l.name?.toLowerCase().includes(term) ||
        l.studentId?.studentId?.toLowerCase().includes(term) ||
        l.hostelNo?.toLowerCase().includes(term) ||
        l.leaveType?.toLowerCase().includes(term) ||
        l.visitPlace?.toLowerCase().includes(term) ||
        l.reason?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(l => l.status === statusFilter);
    }
    
    if (leaveTypeFilter !== "all") {
      filtered = filtered.filter(l => l.leaveType === leaveTypeFilter);
    }
    
    return filtered;
  }, [leaves, searchTerm, statusFilter, leaveTypeFilter]);

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeaves.slice(start, start + itemsPerPage);
  }, [filteredLeaves, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const leaveTypes = useMemo(() => {
    const types = new Set(leaves.map(l => l.leaveType).filter(Boolean));
    return Array.from(types);
  }, [leaves]);

  if (loading) return <div className="admin-page"><p style={{ color: "#ffffff" }}>Loading...</p></div>;

  return (
    <div className="admin-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h2 style={{ color: "#ffffff" }}>Leave Requests Management</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search leave requests..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px 12px", minWidth: "200px", color: "#ffffff" }}
            />
            <select
              className="styled-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px 12px", minWidth: "150px" }}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              className="styled-select"
              value={leaveTypeFilter}
              onChange={(e) => {
                setLeaveTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px 12px", minWidth: "150px" }}
            >
              <option value="all">All Types</option>
              {leaveTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeaves.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#93c5fd" }}>
                  {searchTerm || statusFilter !== "all" || leaveTypeFilter !== "all"
                    ? "No leave requests found matching your filters."
                    : "No leave requests found."}
                </td>
              </tr>
            ) : (
              paginatedLeaves.map(leave => (
                <tr key={leave._id} className={leave.status.toLowerCase()}>
                  <td style={{ color: "#ffffff" }}>{leave.studentId?.name || leave.name} ({leave.studentId?.studentId || leave.hostelNo})</td>
                  <td style={{ color: "#ffffff" }}>{leave.leaveType}</td>
                  <td style={{ color: "#ffffff" }}>{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td style={{ color: "#ffffff" }}>{new Date(leave.endDate).toLocaleDateString()}</td>
                  <td style={{ color: "#ffffff" }}>{leave.days}</td>
                  <td style={{ color: "#ffffff" }}>{leave.status}</td>
                  <td>
                    <button onClick={() => setSelectedLeave(leave)} style={{ marginRight: "5px" }}>View</button>
                    {leave.status === "Pending" && (
                      <>
                        <button onClick={() => handleApprove(leave)} style={{ marginRight: "5px", background: "#22c55e", color: "#ffffff" }}>Approve</button>
                        <button onClick={() => handleReject(leave)} style={{ background: "#ef4444", color: "#ffffff" }}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        {filteredLeaves.length > 0 && (
          <div style={{ marginTop: "12px", color: "#93c5fd", fontSize: "0.9rem", textAlign: "center" }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLeaves.length)} of {filteredLeaves.length} leave requests
          </div>
        )}

        {selectedLeave && (
          <div className="modal-backdrop" onClick={() => setSelectedLeave(null)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedLeave(null)}>×</button>
              <h3>Leave Request Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, color: '#ffffff' }}>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Student:</strong> <span style={{ color: '#e0f2fe' }}>{selectedLeave.studentId?.name || selectedLeave.name}</span></div>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Hostel No:</strong> <span style={{ color: '#e0f2fe' }}>{selectedLeave.hostelNo}</span></div>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Leave Type:</strong> <span style={{ color: '#e0f2fe' }}>{selectedLeave.leaveType}</span></div>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Visit Place:</strong> <span style={{ color: '#e0f2fe' }}>{selectedLeave.visitPlace}</span></div>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Start:</strong> <span style={{ color: '#e0f2fe' }}>{new Date(selectedLeave.startDate).toLocaleString()}</span></div>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>End:</strong> <span style={{ color: '#e0f2fe' }}>{new Date(selectedLeave.endDate).toLocaleString()}</span></div>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Days:</strong> <span style={{ color: '#e0f2fe' }}>{selectedLeave.days}</span></div>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Mobile:</strong> <span style={{ color: '#e0f2fe' }}>{selectedLeave.mobile}</span></div>
                <div style={{ gridColumn: '1 / -1', color: '#ffffff' }}>
                  <strong style={{ color: '#ffffff', display: 'block', marginBottom: '8px' }}>Reason:</strong>
                  <p style={{ color: '#e0f2fe', background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', margin: 0 }}>{selectedLeave.reason}</p>
                </div>
                <div style={{ gridColumn: '1 / -1', color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Status:</strong> <span style={{ color: '#e0f2fe' }}>{selectedLeave.status}</span></div>
              </div>
              {selectedLeave.status === "Pending" && (
                <div style={{ marginTop: "20px" }}>
                  <button onClick={() => handleApprove(selectedLeave)} style={{ marginRight: "10px", padding: "10px", background: "#22c55e", color: "#ffffff" }}>Approve</button>
                  <button onClick={() => handleReject(selectedLeave)} style={{ padding: "10px", background: "#ef4444", color: "#ffffff" }}>Reject</button>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}

