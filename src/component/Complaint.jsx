import React, { useEffect, useMemo, useState } from 'react';
import '../css/Complaint.css';
import Navbar from './Navbar';
import { complaintsAPI } from '../utils/api';

function Complaint() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const categories = [
    { value: 'room-maintenance', label: 'Room Maintenance', icon: 'wrench', color: '#60a5fa' },
    { value: 'food-quality', label: 'Food Quality', icon: 'utensils', color: '#f87171' },
    { value: 'staff-behavior', label: 'Staff Behavior', icon: 'user-tie', color: '#fbbf24' },
    { value: 'wifi-electricity', label: 'WiFi / Electricity', icon: 'wifi', color: '#a78bfa' },
    { value: 'other', label: 'Other', icon: 'ellipsis-h', color: '#94a3b8' },
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const studentId = sessionStorage.getItem('studentId');
      if (!studentId) {
        setError('Missing student ID. Please log in again.');
        setComplaints([]);
        return;
      }
      const res = await complaintsAPI.getByStudent(studentId);
      setComplaints(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
    const interval = setInterval(() => {
      loadComplaints();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.title || !formData.description) return;
    try {
      setSubmitting(true);
      setError('');
      await complaintsAPI.create({
        title: formData.title,
        category: formData.category,
        description: formData.description,
      });
    setFormData({ category: '', title: '', description: '' });
    setShowForm(false);
      await loadComplaints();
      const { showSuccess } = await import("../components/DialogProvider");
      const { showNotification } = await import("../components/Notification");
      showSuccess('Complaint submitted successfully!');
      showNotification('Complaint submitted', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#fca5a5';
      case 'in-progress': return '#fcd34d';
      case 'resolved': return '#86efac';
      default: return '#e0f2fe';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const getCategoryInfo = (value) => {
    return categories.find(c => c.value === value) || categories[categories.length - 1];
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const complaintsWithUi = useMemo(() => {
    const mapped = complaints.map((c) => ({
      id: c._id || c.id,
      title: c.title,
      category: c.category,
      description: c.description,
      status: c.status || 'pending',
      submittedAt: c.submittedAt || c.createdAt || new Date().toISOString(),
      resolvedAt: c.resolvedAt || null,
      resolutionMessage: c.resolutionMessage || null,
    }));
    
    if (!searchTerm && statusFilter === 'all') return mapped;
    
    const term = searchTerm.toLowerCase();
    return mapped.filter(c => {
      const matchesSearch = !searchTerm || (
        (c.title || '').toLowerCase().includes(term) ||
        (c.description || '').toLowerCase().includes(term) ||
        (c.category || '').toLowerCase().includes(term)
      );
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchTerm, statusFilter]);

  return (
    <>
      <Navbar />
      <div className="complaint-page">
        <div className="particles"></div>
        <div className="page-header">
          <h1>My Complaints</h1>
          <h2>Submit & Track Your Hostel Issues</h2>
        </div>

        <div className="complaints-container">
          <div className="glass-card">

            {error && (
              <p className="alert error" role="alert" style={{ marginBottom: '1rem' }}>{error}</p>
            )}

            {/* Toggle Form Button */}
            <div className="header-actions">
              <button
                className="new-complaint-btn"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel Filing' : '+ File New Complaint'}
              </button>
            </div>

            {/* New Complaint Form */}
            {showForm && (
              <form className="complaint-form" onSubmit={handleSubmit}>
                <h3>File a New Complaint</h3>

                <div className="form-group">
                  <label>Category <span className="required">*</span></label>
                  <div className="category-select-wrapper">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="category-select"
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value} data-icon={cat.icon} data-color={cat.color}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <span className="select-icon">
                      <i className={`fas fa-${getCategoryInfo(formData.category)?.icon || 'question-circle'}`}></i>
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Title <span className="required">*</span></label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g., Broken window in Room 305"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description <span className="required">*</span></label>
                  <textarea
                    name="description"
                    placeholder="Provide details about the issue..."
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                  {/* Only ONE Cancel Button */}
                  <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Search & Filter */}
            <div className="search-filter" style={{ marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search complaints by title, description, or category..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '10px 15px', 
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff'
                }}
              />
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="styled-select"
                style={{ 
                  padding: '10px 15px', 
                  borderRadius: '8px',
                  minWidth: '150px',
                  color: '#ffffff'
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Complaints List */}
            <div className="complaints-list">
              <h3>Your Submitted Complaints</h3>
              {loading ? (
                <p className="no-complaints">Loading...</p>
              ) : complaintsWithUi.length === 0 ? (
                <p className="no-complaints">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No complaints found matching your search.' 
                    : 'No complaints filed yet. Click above to submit one!'}
                </p>
              ) : (
                <div className="complaint-items">
                  {complaintsWithUi.map((complaint) => (
                    <div
                      key={complaint.id}
                      className={`complaint-item ${complaint.status} ${selectedComplaint?.id === complaint.id ? 'selected' : ''}`}
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <div className="complaint-header">
                        <h4>{complaint.title}</h4>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(complaint.status) }}
                        >
                          {getStatusText(complaint.status)}
                        </span>
                      </div>
                      <p className="category">
                        <i className={`fas fa-${getCategoryInfo(complaint.category).icon}`}></i>
                        {getCategoryInfo(complaint.category).label}
                      </p>
                      <p className="date">Submitted: {new Date(complaint.submittedAt).toLocaleDateString()}</p>
                      {complaint.resolvedAt && (
                        <p className="date">Resolved: {new Date(complaint.resolvedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Complaint Details */}
            {selectedComplaint && (
              <div className="complaint-details">
                <div className="details-header">
                  <h3>Complaint Details</h3>
                  <button
                    className="close-details-btn"
                    onClick={() => setSelectedComplaint(null)}
                    aria-label="Close details"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="detail-row">
                  <strong>Title:</strong> {selectedComplaint.title}
                </div>

                <div className="detail-row">
                  <strong>Category:</strong>{' '}
                  <span
                    className="category-badge"
                    style={{ backgroundColor: getCategoryInfo(selectedComplaint.category).color }}
                  >
                    <i className={`fas fa-${getCategoryInfo(selectedComplaint.category).icon}`}></i>
                    {getCategoryInfo(selectedComplaint.category).label}
                  </span>
                </div>

                <div className="detail-row">
                  <strong>Status:</strong>{' '}
                  <span
                    className="status-inline"
                    style={{ color: getStatusColor(selectedComplaint.status) }}
                  >
                    {getStatusText(selectedComplaint.status)}
                  </span>
                </div>

                <div className="detail-row">
                  <strong>Description:</strong>
                  <p className="description-text">{selectedComplaint.description}</p>
                </div>

                {selectedComplaint.resolutionMessage && (
                  <div className="detail-row resolution" style={{ 
                    background: "rgba(34, 197, 94, 0.15)", 
                    padding: "16px", 
                    borderRadius: "12px", 
                    borderLeft: "4px solid #22c55e",
                    marginTop: "16px"
                  }}>
                    <strong style={{ color: "#ffffff", display: "block", marginBottom: "8px", fontSize: "1.1rem" }}>Resolution:</strong>
                    <p className="resolution-text" style={{ color: "#86efac", margin: 0, fontSize: "1rem", lineHeight: "1.6", fontWeight: "500" }}>
                      {selectedComplaint.resolutionMessage}
                    </p>
                  </div>
                )}

                <div className="detail-row">
                  <strong>Submitted On:</strong> {new Date(selectedComplaint.submittedAt).toLocaleDateString()}
                </div>
                {selectedComplaint.resolvedAt && (
                  <div className="detail-row">
                    <strong>Resolved On:</strong> {new Date(selectedComplaint.resolvedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Complaint;