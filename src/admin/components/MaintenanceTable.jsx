import { useState, useEffect, useMemo } from "react";
import { maintenanceAPI } from "../../utils/api";
import { showConfirm, showError, showSuccess, showWarning } from "../../components/DialogProvider";
import { showNotification } from "../../components/Notification";
import Pagination from "./Pagination";
import "../../css/Dropdown.css";

export default function MaintenanceAdmin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [problemTypeFilter, setProblemTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await maintenanceAPI.getAll();
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error loading maintenance requests:", error);
      showError("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      if (status === "resolved" && !resolutionNotes.trim()) {
        showWarning("Please provide resolution notes before resolving the maintenance request.");
        return;
      }
      const updateData = { status };
      if (status === "resolved" && resolutionNotes) {
        updateData.resolutionNotes = resolutionNotes.trim();
      }
      await maintenanceAPI.update(id, updateData);
      showSuccess(`Maintenance request ${status === "resolved" ? "resolved" : "updated"} successfully`);
      loadRequests();
      setSelectedRequest(null);
      setResolutionNotes("");
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update maintenance request");
    }
  };

  const filteredRequests = useMemo(() => {
    let filtered = requests;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.title?.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term) ||
        r.studentId?.name?.toLowerCase().includes(term) ||
        r.studentId?.studentId?.toLowerCase().includes(term) ||
        r.room?.toLowerCase().includes(term) ||
        r.problemType?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (problemTypeFilter !== "all") {
      filtered = filtered.filter(r => r.problemType === problemTypeFilter);
    }
    
    return filtered;
  }, [requests, searchTerm, statusFilter, problemTypeFilter]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const problemTypes = useMemo(() => {
    const types = new Set(requests.map(r => r.problemType).filter(Boolean));
    return Array.from(types);
  }, [requests]);

  if (loading) return <div className="admin-page"><p style={{ color: "#ffffff" }}>Loading...</p></div>;

  return (
    <div className="admin-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h2 style={{ color: "#ffffff" }}>Maintenance Requests Management</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search requests..."
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
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              className="styled-select"
              value={problemTypeFilter}
              onChange={(e) => {
                setProblemTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px 12px", minWidth: "150px" }}
            >
              <option value="all">All Types</option>
              {problemTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Room</th>
              <th>Problem Type</th>
              <th>Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#93c5fd" }}>
                  {searchTerm || statusFilter !== "all" || problemTypeFilter !== "all"
                    ? "No maintenance requests found matching your filters."
                    : "No maintenance requests found."}
                </td>
              </tr>
            ) : (
              paginatedRequests.map(request => (
                <tr key={request._id} className={request.status}>
                  <td style={{ color: "#ffffff" }}>{request.studentId?.name || "N/A"} ({request.studentId?.studentId || "N/A"})</td>
                  <td style={{ color: "#ffffff" }}>{request.room}</td>
                  <td style={{ color: "#ffffff" }}>{request.problemType}</td>
                  <td style={{ color: "#ffffff" }}>{request.title}</td>
                  <td style={{ color: "#ffffff" }}>{new Date(request.date).toLocaleDateString()}</td>
                  <td style={{ color: "#ffffff", textTransform: "capitalize" }}>{request.status}</td>
                  <td>
                    <button onClick={() => setSelectedRequest(request)} style={{ marginRight: "5px" }}>View</button>
                    {request.status !== "resolved" && (
                      <button onClick={() => handleStatusUpdate(request._id, request.status === "open" ? "in-progress" : "resolved")}>
                        {request.status === "open" ? "Start Progress" : "Resolve"}
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
        {filteredRequests.length > 0 && (
          <div style={{ marginTop: "12px", color: "#93c5fd", fontSize: "0.9rem", textAlign: "center" }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
          </div>
        )}

        {selectedRequest && (
          <div className="modal-backdrop" onClick={() => { setSelectedRequest(null); setResolutionNotes(""); }}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => { setSelectedRequest(null); setResolutionNotes(""); }}>×</button>
              <h3>Maintenance Request Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, color: '#ffffff' }}>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Student:</strong> <span style={{ color: '#e0f2fe' }}>{selectedRequest.studentId?.name || "N/A"}</span></div>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Room:</strong> <span style={{ color: '#e0f2fe' }}>{selectedRequest.room}</span></div>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Problem Type:</strong> <span style={{ color: '#e0f2fe' }}>{selectedRequest.problemType}</span></div>
                <div style={{ color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Status:</strong> <span style={{ color: '#e0f2fe', textTransform: 'capitalize' }}>{selectedRequest.status}</span></div>
                <div style={{ gridColumn: '1 / -1', color: '#ffffff' }}><strong style={{ color: '#ffffff' }}>Title:</strong> <span style={{ color: '#e0f2fe' }}>{selectedRequest.title}</span></div>
                <div style={{ gridColumn: '1 / -1', color: '#ffffff' }}>
                  <strong style={{ color: '#ffffff', display: 'block', marginBottom: '8px' }}>Description:</strong>
                  <p style={{ color: '#e0f2fe', background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', margin: 0 }}>{selectedRequest.description}</p>
                </div>
              </div>
              {selectedRequest.resolutionNotes && (
                <div className="resolution" style={{ marginTop: "16px", padding: "16px", background: "rgba(34, 197, 94, 0.15)", borderRadius: "12px", borderLeft: "4px solid #22c55e" }}>
                  <strong style={{ color: "#ffffff", display: "block", marginBottom: "8px", fontSize: "1.1rem" }}>Resolution Notes:</strong>
                  <p className="resolution-text" style={{ color: "#86efac", margin: 0, fontSize: "1rem", lineHeight: "1.6" }}>{selectedRequest.resolutionNotes}</p>
                </div>
              )}
              {selectedRequest.status !== "resolved" && (
                <div style={{ marginTop: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", color: "#ffffff", fontWeight: "600" }}>
                    Resolution Notes <span style={{ color: "#fca5a5" }}>*</span>
                  </label>
                  <textarea
                    placeholder="Enter resolution notes (required when resolving)"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
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
                    required={selectedRequest.status === "in-progress"}
                  />
                  <p style={{ fontSize: "0.85rem", color: "#93c5fd", marginBottom: "12px" }}>
                    Please provide details about how this maintenance request was resolved.
                  </p>
                  <button onClick={() => handleStatusUpdate(selectedRequest._id, selectedRequest.status === "open" ? "in-progress" : "resolved")} style={{ marginRight: "10px" }}>
                    {selectedRequest.status === "open" ? "Start Progress" : "Resolve"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}

