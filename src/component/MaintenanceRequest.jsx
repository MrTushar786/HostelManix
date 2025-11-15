import React, { useEffect, useMemo, useState } from 'react';
import '../css/MaintenanceRequest.css';
import Navbar from './Navbar';
import { maintenanceAPI } from '../utils/api';

const MaintenanceRequest = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ---------- Form State ----------
    const [form, setForm] = useState({
        room: '',
        problemType: '',
        title: '',
        description: '',
    });

    // ---------- Requests List ----------
    const [requests, setRequests] = useState([]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError('');
            const studentId = sessionStorage.getItem('studentId');
            if (!studentId) {
                setError('Missing student ID. Please log in again.');
                setRequests([]);
                return;
            }
            const res = await maintenanceAPI.getByStudent(studentId);
            setRequests(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load maintenance requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
        const interval = setInterval(() => loadRequests(), 15000);
        return () => clearInterval(interval);
    }, []);

    // ---------- Handlers ----------
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.room || !form.problemType || !form.title) {
            const { showWarning } = await import("../components/DialogProvider");
            showWarning('Please fill in Room, Problem Type, and Title.');
            return;
        }
        try {
            setSubmitting(true);
            setError('');
            await maintenanceAPI.create({
            room: parseInt(form.room),
            problemType: form.problemType,
            title: form.title,
            description: form.description,
            status: 'open',
            });
        setForm({ room: '', problemType: '', title: '', description: '' });
            await loadRequests();
        const { showSuccess } = await import("../components/DialogProvider");
        const { showNotification } = await import("../components/Notification");
        showSuccess('Maintenance request submitted successfully!');
        showNotification('Maintenance request submitted', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit maintenance request');
        } finally {
            setSubmitting(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredRequests = useMemo(() => {
        if (!searchTerm && statusFilter === 'all') return requests;
        const term = searchTerm.toLowerCase();
        return requests.filter(r => {
            const matchesSearch = !searchTerm || (
                (r.title || '').toLowerCase().includes(term) ||
                (r.description || '').toLowerCase().includes(term) ||
                (r.problemType || '').toLowerCase().includes(term) ||
                (r.room?.toString() || '').includes(term)
            );
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'open' && (r.status || 'open') === 'open') ||
                (statusFilter === 'in-progress' && (r.status || '').toLowerCase() === 'in-progress') ||
                (statusFilter === 'resolved' && (r.status || '').toLowerCase() === 'resolved');
            return matchesSearch && matchesStatus;
        });
    }, [requests, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        const open = requests.filter(r => (r.status || 'open') === 'open').length;
        const inProgress = requests.filter(r => (r.status || '').toLowerCase() === 'in-progress').length;
        const resolved = requests.filter(r => (r.status || '').toLowerCase() === 'resolved').length;
        return { open, inProgress, resolved, total: requests.length };
    }, [requests]);

    return (
        <>
           <Navbar />
            <div className="maintenance-page">
                <div className="particles" />
                <header className="page-header">
                    <h1>Maintenance Request</h1>
                    <h2>Report Room Issues & Track Progress</h2>
                </header>

                <div className="maintenance-container">
                    <div className="glass-card">

                        {error && (
                            <p className="alert error" role="alert" style={{ marginBottom: '1rem' }}>{error}</p>
                        )}

                        {/* ---- Stats ---- */}
                        <div className="stats-grid">
                            <div className="stat-card open">
                                <span>Open</span>
                                <strong>{stats.open}</strong>
                            </div>
                            <div className="stat-card in-progress">
                                <span>In Progress</span>
                                <strong>{stats.inProgress}</strong>
                            </div>
                            <div className="stat-card resolved">
                                <span>Resolved</span>
                                <strong>{stats.resolved}</strong>
                            </div>
                            <div className="stat-card total">
                                <span>Total Requests</span>
                                <strong>{stats.total}</strong>
                            </div>
                        </div>

                        {/* ---- Request Form ---- */}
                        <form className="request-form" onSubmit={handleSubmit}>
                            <h3 style={{ color: 'white', marginBottom: '1.5rem', textAlign: 'center' }}>
                                Report a New Problem
                            </h3>
                            <div className="form-group">
                                <label>Room Number *</label>
                                <input
                                    type="number"
                                    name="room"
                                    placeholder="e.g., 101"
                                    value={form.room}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Problem Type *</label>
                                <select
                                    name="problemType"
                                    value={form.problemType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select problem type</option>
                                    <option value="electrical">Electrical (Fan, Light, Switch)</option>
                                    <option value="plumbing">Plumbing (Tap, Toilet, Pipe)</option>
                                    <option value="furniture">Furniture (Chair, Bed, Table)</option>
                                    <option value="cleaning">Cleaning (Dust, Waste, Pest)</option>
                                    <option value="ac">AC / Cooler</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Short description of the issue"
                                    value={form.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea
                                    name="description"
                                    placeholder="Provide more details..."
                                    value={form.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <button type="submit" className="submit-btn" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>

                        {/* ---- Search & Filter ---- */}
                        <div className="search-filter" style={{ marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="Search by title, description, problem type, or room..."
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
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>

                        {/* ---- Request List ---- */}
                        <div className="request-list">
                            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Recent Requests</h3>
                            {loading ? (
                                <div className="request-item" style={{ color: '#ffffff' }}>Loading...</div>
                            ) : filteredRequests.length === 0 ? (
                                <div className="request-item" style={{ color: '#93c5fd', textAlign: 'center', padding: '20px' }}>
                                    {searchTerm || statusFilter !== 'all' 
                                        ? 'No requests found matching your search.' 
                                        : 'No maintenance requests submitted yet.'}
                                </div>
                            ) : filteredRequests.map(req => (
                                <div key={req._id || req.id} className="request-item">
                                    <div className="request-header">
                                        <div className="request-id">#{(req._id || req.id).toString().slice(-6)} – Room {req.room}</div>
                                        <div className="request-date">{new Date(req.date || req.createdAt || Date.now()).toLocaleDateString()}</div>
                                    </div>
                                    <div className="request-body">
                                        <strong>{req.title}</strong>
                                        {req.description && <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem' }}>{req.description}</p>}
                                    </div>
                                    <div className="request-meta">
                                        <span className={`problem-type ${req.problemType}`}>
                                            {req.problemType.charAt(0).toUpperCase() + req.problemType.slice(1)}
                                        </span>
                                        <span className={`request-status ${req.status}`}>
                                            {(req.status || 'open').replace('-', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </>
    );
};

export default MaintenanceRequest;