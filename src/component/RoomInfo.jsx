import React, { useEffect, useMemo, useState } from 'react';
import '../css/RoomInfo.css';
import Navbar from './Navbar';
import { roomsAPI, studentsAPI } from '../utils/api';

const RoomInfo = () => {
    const [allRooms, setAllRooms] = useState([]);
    const [myRoom, setMyRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError('');
                const [roomsRes, studentRes] = await Promise.all([
                    roomsAPI.getAll(),
                    studentsAPI.getMe().catch(() => null)
                ]);
                const mapped = (roomsRes.data || []).map(r => ({
                    id: r.roomNumber,
                    _id: r._id,
                    floor: r.floor,
                    capacity: r.capacity,
                    occupants: r.occupants,
                    status: r.status,
                    block: r.block || 'A',
                }));
                setAllRooms(mapped);
                
                // Find student's assigned room
                if (studentRes?.data?.roomId) {
                    const myRoomData = mapped.find(r => r._id === studentRes.data.roomId._id || r._id === studentRes.data.roomId);
                    if (myRoomData) {
                        setMyRoom(myRoomData);
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load rooms');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // ---------- State ----------
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedRoom, setSelectedRoom] = useState(null);

    // ---------- Filtering ----------
    const filteredRooms = useMemo(() => {
        if (!searchTerm && filterStatus === 'all') return allRooms;
        return allRooms.filter(room => {
            const matchesSearch = !searchTerm || (
                (room.id?.toString() || '').includes(searchTerm) ||
                (room.block?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (room.floor?.toString() || '').includes(searchTerm)
            );
            const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [allRooms, searchTerm, filterStatus]);

    const stats = useMemo(() => {
        const occupied = allRooms.filter(r => r.status === 'occupied').length;
        const vacant = allRooms.filter(r => r.status === 'vacant').length;
        const maintenance = allRooms.filter(r => r.status === 'maintenance').length;
        return { occupied, vacant, maintenance, total: allRooms.length };
    }, [allRooms]);

    // ---------- Handlers ----------
    const openModal = (room) => setSelectedRoom(room);
    const closeModal = () => setSelectedRoom(null);

    return (
        <>
            <Navbar />
            <div className="room-info-page">
                <div className="particles" />
                <header className="page-header">
                    <h1>Room Information</h1>
                    <h2>Hostel Room Overview & Details</h2>
                    {myRoom && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: 'rgba(34, 197, 94, 0.2)',
                            border: '2px solid #86efac',
                            borderRadius: '16px',
                            display: 'inline-block'
                        }}>
                            <strong style={{ color: '#86efac', fontSize: '1.1rem' }}>
                                🏠 Your Assigned Room: {myRoom.block}-{myRoom.id} (Floor {myRoom.floor})
                            </strong>
                        </div>
                    )}
                </header>

                <div className="room-info-container">
                    <div className="glass-card">

                        {/* ---- Stats ---- */}
                        <div className="stats-grid">
                            <div className="stat-card occupied">
                                <span>Occupied</span>
                                <strong>{stats.occupied}</strong>
                            </div>
                            <div className="stat-card vacant">
                                <span>Vacant</span>
                                <strong>{stats.vacant}</strong>
                            </div>
                            <div className="stat-card maintenance">
                                <span>Under Maintenance</span>
                                <strong>{stats.maintenance}</strong>
                            </div>
                            <div className="stat-card total">
                                <span>Total Rooms</span>
                                <strong>{stats.total}</strong>
                            </div>
                        </div>

                        {/* ---- Search & Filter ---- */}
                        <div className="search-filter">
                            <input
                                type="text"
                                placeholder="Search room number..."
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
                                <option value="occupied">Occupied</option>
                                <option value="vacant">Vacant</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>

                        {error && (
                            <p className="alert error" role="alert" style={{ marginBottom: '1rem' }}>{error}</p>
                        )}

                        {/* ---- Room Grid ---- */}
                        <div className="room-grid">
                            {loading ? (
                                <div className="room-card">Loading...</div>
                            ) : filteredRooms.map(room => {
                                const isMyRoom = myRoom && (room._id === myRoom._id || room.id === myRoom.id);
                                return (
                                    <div
                                        key={room.id}
                                        className={`room-card ${room.status} ${isMyRoom ? 'my-room' : ''}`}
                                        onClick={() => openModal(room)}
                                        style={isMyRoom ? {
                                            border: '3px solid #86efac',
                                            boxShadow: '0 0 20px rgba(134, 239, 172, 0.5)',
                                            transform: 'scale(1.02)'
                                        } : {}}
                                    >
                                        {isMyRoom && <div style={{ 
                                            position: 'absolute', 
                                            top: '8px', 
                                            right: '8px',
                                            background: '#22c55e',
                                            color: '#fff',
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700'
                                        }}>MY ROOM</div>}
                                        <h4>Room {room.id}</h4>
                                        <p>Block {room.block} • Floor {room.floor}</p>
                                        <p>{room.occupants}/{room.capacity} Occupied</p>
                                        <div className="status">
                                            {room.status.replace(/^\w/, c => c.toUpperCase())}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </div>

                {/* ---- Modal (Detail View) ---- */}
                {selectedRoom && (
                    <div className="modal-backdrop" onClick={closeModal}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3>Room {selectedRoom.id} Details</h3>
                            <p><strong>Floor:</strong> {selectedRoom.floor}</p>
                            <p><strong>Capacity:</strong> {selectedRoom.capacity} beds</p>
                            <p><strong>Current Occupants:</strong> {selectedRoom.occupants}</p>
                            <p><strong>Status:</strong> <span className={`status ${selectedRoom.status}`}>
                                {selectedRoom.status.replace(/^\w/, c => c.toUpperCase())}
                            </span></p>
                            <button className="close-btn" onClick={closeModal}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default RoomInfo;