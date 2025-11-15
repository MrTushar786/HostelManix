import { useState, useEffect, useMemo } from "react";
import { complaintsAPI } from "../../utils/api";
import { showConfirm, showError, showSuccess, showWarning } from "../../components/DialogProvider";
import { showNotification } from "../../components/Notification";
import Pagination from "./Pagination";
import "../../css/Dropdown.css";

export default function ComplaintAdmin() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionMessage, setResolutionMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintsAPI.getAll();
      setComplaints(response.data || []);
    } catch (error) {
      console.error("Error loading complaints:", error);
      showError("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      if (status === "resolved" && !resolutionMessage.trim()) {
        showWarning("Please provide a resolution message before resolving the complaint.");
        return;
      }
      const updateData = { status };
      if (status === "resolved" && resolutionMessage) {
        updateData.resolutionMessage = resolutionMessage.trim();
      }
      await complaintsAPI.update(id, updateData);
      showSuccess(`Complaint ${status === "resolved" ? "resolved" : "updated"} successfully`);
      loadComplaints();
      setSelectedComplaint(null);
      setResolutionMessage("");
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update complaint");
    }
  };

  const filteredComplaints = useMemo(() => {
    let filtered = complaints;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.title?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.studentId?.name?.toLowerCase().includes(term) ||
        c.studentId?.studentId?.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }
    
    return filtered;
  }, [complaints, searchTerm, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredComplaints.slice(start, start + itemsPerPage);
  }, [filteredComplaints, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const categories = useMemo(() => {
    const cats = new Set(complaints.map(c => c.category).filter(Boolean));
    return Array.from(cats);
  }, [complaints]);

  if (loading) return <div className="admin-page"><p style={{ color: "#ffffff" }}>Loading...</p></div>;

  return (
    <div className="admin-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h2 style={{ color: "#ffffff" }}>Complaints Management</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search complaints..."
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
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              className="styled-select"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px 12px", minWidth: "150px" }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Title</th>
              <th>Category</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedComplaints.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#93c5fd" }}>
                  {searchTerm || statusFilter !== "all" || categoryFilter !== "all" 
                    ? "No complaints found matching your filters." 
                    : "No complaints found."}
                </td>
              </tr>
            ) : (
              paginatedComplaints.map(complaint => (
                <tr key={complaint._id} className={complaint.status}>
                  <td style={{ color: "#ffffff" }}>{complaint.studentId?.name || "N/A"} ({complaint.studentId?.studentId || "N/A"})</td>
                  <td style={{ color: "#ffffff" }}>{complaint.title}</td>
                  <td style={{ color: "#ffffff" }}>{complaint.category}</td>
                  <td style={{ color: "#ffffff" }}>{new Date(complaint.submittedAt).toLocaleDateString()}</td>
                  <td style={{ color: "#ffffff", textTransform: "capitalize" }}>{complaint.status}</td>
                  <td>
                    <button onClick={() => setSelectedComplaint(complaint)} style={{ marginRight: "5px" }}>View</button>
                    {complaint.status !== "resolved" && (
                      <button onClick={() => handleStatusUpdate(complaint._id, complaint.status === "pending" ? "in-progress" : "resolved")}>
                        {complaint.status === "pending" ? "Start Progress" : "Resolve"}
                      </button>
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
        {filteredComplaints.length > 0 && (
          <div style={{ marginTop: "12px", color: "#93c5fd", fontSize: "0.9rem", textAlign: "center" }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} complaints
          </div>
        )}

        {selectedComplaint && (
          <div className="modal-backdrop" onClick={() => { setSelectedComplaint(null); setResolutionMessage(""); }}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => { setSelectedComplaint(null); setResolutionMessage(""); }}>×</button>
              <h3>Complaint Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, color: '#ffffff' }}>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Student:</strong> <span style={{ color: '#e0f2fe' }}>{selectedComplaint.studentId?.name || "N/A"}</span></div>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Category:</strong> <span style={{ color: '#e0f2fe' }}>{selectedComplaint.category}</span></div>
                <div style={{ gridColumn: '1 / -1', color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Title:</strong> <span style={{ color: '#e0f2fe' }}>{selectedComplaint.title}</span></div>
                <div style={{ gridColumn: '1 / -1', color: '#ffffff' }}>
                  <strong style={{ color: '#ffffff', display: 'block', marginBottom: '8px' }}>Description:</strong>
                  <p style={{ color: '#e0f2fe', background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', margin: 0 }}>{selectedComplaint.description}</p>
                </div>
                <div style={{ gridColumn: '1 / -1', color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Status:</strong> <span style={{ color: '#e0f2fe', textTransform: 'capitalize' }}>{selectedComplaint.status}</span></div>
              </div>
              {selectedComplaint.resolutionMessage && (
                <div className="resolution" style={{ marginTop: "16px", padding: "16px", background: "rgba(34, 197, 94, 0.15)", borderRadius: "12px", borderLeft: "4px solid #22c55e" }}>
                  <strong style={{ color: "#ffffff", display: "block", marginBottom: "8px", fontSize: "1.1rem" }}>Resolution:</strong>
                  <p className="resolution-text" style={{ color: "#86efac", margin: 0, fontSize: "1rem", lineHeight: "1.6" }}>{selectedComplaint.resolutionMessage}</p>
                </div>
              )}
              {selectedComplaint.status !== "resolved" && (
                <div style={{ marginTop: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", color: "#ffffff", fontWeight: "600" }}>
                    Resolution Message <span style={{ color: "#fca5a5" }}>*</span>
                  </label>
                  <textarea
                    placeholder="Enter resolution message (required when resolving)"
                    value={resolutionMessage}
                    onChange={(e) => setResolutionMessage(e.target.value)}
                    style={{ 
                      width: "100%", 
                      minHeight: "100px", 
                      marginBottom: "10px",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: "8px",
                      padding: "12px",
                      color: "#ffffff",
                      fontSize: "1rem"
                    }}
                    required={selectedComplaint.status === "in-progress"}
                  />
                  <p style={{ fontSize: "0.85rem", color: "#93c5fd", marginBottom: "12px" }}>
                    Please provide details about how this complaint was resolved.
                  </p>
                  <button onClick={() => handleStatusUpdate(selectedComplaint._id, selectedComplaint.status === "pending" ? "in-progress" : "resolved")} style={{ marginRight: "10px" }}>
                    {selectedComplaint.status === "pending" ? "Start Progress" : "Resolve"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}

