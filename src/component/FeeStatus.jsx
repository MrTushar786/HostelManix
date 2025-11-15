import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import '../css/FeeStatus.css';
import Navbar from './Navbar';
import { feesAPI } from '../utils/api';

const FeeStatus = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [allFees, setAllFees] = useState([]);

    useEffect(() => {
        const loadFees = async () => {
            try {
                setLoading(true);
                setError('');
                const studentId = sessionStorage.getItem('studentId');
                if (!studentId) {
                    setError('Missing student ID. Please log in again.');
                    setAllFees([]);
                    return;
                }
                const res = await feesAPI.getByStudent(studentId);
                const mapped = (res.data || []).map(f => ({
                    id: f._id,
                    student: f.studentId?.name || 'Me',
                    room: f.studentId?.roomId || '-',
                    amount: f.amount || 0,
                    dueDate: f.dueDate || f.createdAt || new Date().toISOString(),
                    status: (f.status || 'pending').toLowerCase(),
                }));
                setAllFees(mapped);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load fees');
            } finally {
                setLoading(false);
            }
        };
        loadFees();
        const interval = setInterval(() => loadFees(), 20000);
        return () => clearInterval(interval);
    }, []);

    const stats = useMemo(() => {
        const paid = allFees.filter(f => f.status === 'paid').length;
        const pending = allFees.filter(f => f.status === 'pending').length;
        const overdue = allFees.filter(f => f.status === 'overdue').length;
        return { paid, pending, overdue, total: allFees.length };
    }, [allFees]);

    const chartData = useMemo(() => {
        const paid = allFees.filter(f => f.status === 'paid').length;
        const pending = allFees.filter(f => f.status === 'pending').length;
        const overdue = allFees.filter(f => f.status === 'overdue').length;
        return [
            { name: 'Paid', value: paid, color: '#86efac' },
            { name: 'Pending', value: pending, color: '#fcd34d' },
            { name: 'Overdue', value: overdue, color: '#fca5a5' }
        ].filter(item => item.value > 0);
    }, [allFees]);

    const COLORS = ['#86efac', '#fcd34d', '#fca5a5'];

    // ---------- State ----------
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // ---------- Filtering ----------
    const filteredFees = useMemo(() => {
        if (!searchTerm && filterStatus === 'all') return allFees;
        const term = searchTerm.toLowerCase();
        return allFees.filter(fee => {
            const matchesSearch = !searchTerm || (
                (fee.student || '').toLowerCase().includes(term) ||
                (fee.id?.toString() || '').toLowerCase().includes(term) ||
                (fee.room?.toString() || '').includes(term) ||
                (fee.amount?.toString() || '').includes(term)
            );
            const matchesStatus = filterStatus === 'all' || fee.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [allFees, searchTerm, filterStatus]);

    // ---------- Handlers ----------
    const handlePay = () => {
        navigate('/coming-soon');
    };

    return (
        <>
            <Navbar />
            <div className="fee-status-page">
                <div className="particles" />
                <header className="page-header">
                    <h1>Fee Status</h1>
                    <h2>Track Hostel Fee Payments</h2>
                </header>

                <div className="fee-status-container">
                    <div className="glass-card">

                        {error && (
                            <p className="alert error" role="alert" style={{ marginBottom: '1rem' }}>{error}</p>
                        )}

                        {/* ---- Stats ---- */}
                        <div className="stats-grid">
                            <div className="stat-card paid">
                                <span>Paid</span>
                                <strong>{stats.paid}</strong>
                            </div>
                            <div className="stat-card pending">
                                <span>Pending</span>
                                <strong>{stats.pending}</strong>
                            </div>
                            <div className="stat-card overdue">
                                <span>Overdue</span>
                                <strong>{stats.overdue}</strong>
                            </div>
                            <div className="stat-card total">
                                <span>Total Students</span>
                                <strong>{stats.total}</strong>
                            </div>
                        </div>

                        {/* ---- Search & Filter ---- */}
                        <div className="search-filter">
                            <input
                                type="text"
                                placeholder="Search by name, ID, room, or amount..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ color: '#ffffff' }}
                            />
                            <select 
                                value={filterStatus} 
                                onChange={e => setFilterStatus(e.target.value)}
                                className="styled-select"
                                style={{ color: '#ffffff' }}
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>

                        {/* ---- Fee Table ---- */}
                        <div className="fee-table-wrapper">
                            <table className="fee-table">
                                <thead>
                                    <tr>
                                        <th>Fee ID</th>
                                        <th>Student</th>
                                        <th>Room</th>
                                        <th>Amount</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} style={{ color: '#ffffff', textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
                                ) : filteredFees.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ color: '#93c5fd', textAlign: 'center', padding: '20px' }}>
                                            {searchTerm || filterStatus !== 'all' 
                                                ? 'No fees found matching your search.' 
                                                : 'No fees found.'}
                                        </td>
                                    </tr>
                                ) : filteredFees.map(fee => (
                                    <tr key={fee.id}>
                                        <td style={{ color: '#ffffff' }}>{fee.id?.toString().slice(-8) || 'N/A'}</td>
                                        <td style={{ color: '#ffffff' }}>{fee.student || 'N/A'}</td>
                                        <td style={{ color: '#ffffff' }}>{fee.room || '-'}</td>
                                        <td className="amount" style={{ color: '#ffffff' }}>₹{fee.amount?.toLocaleString() || '0'}</td>
                                        <td className="due-date" style={{ color: '#ffffff' }}>{new Date(fee.dueDate).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge ${fee.status}`}>
                                                {fee.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {fee.status !== 'paid' && (
                                                <button className="pay-btn" onClick={handlePay}>
                                                    Pay Now
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>

                        {/* ---- Summary Bars ---- */}
                        <div className="summary-bars">
                            <div className="bar paid">
                                <span>Paid: {stats.paid} students</span>
                                <span>₹{(stats.paid * 15000).toLocaleString()}</span>
                            </div>
                            <div className="bar pending">
                                <span>Pending: {stats.pending} students</span>
                                <span>₹{(stats.pending * 15000).toLocaleString()}</span>
                            </div>
                            <div className="bar overdue">
                                <span>Overdue: {stats.overdue} students</span>
                                <span>₹{(stats.overdue * 15000).toLocaleString()}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default FeeStatus;