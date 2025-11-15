import { useState, useEffect, useMemo } from "react";
import { roomsAPI } from "../../utils/api";
import Pagination from "./Pagination";
import "../../css/Dropdown.css";

export default function RoomAdmin() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [viewRoom, setViewRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [formData, setFormData] = useState({
    block: "A",
    roomNumber: "",
    floor: "",
    capacity: 4,
    occupants: 0,
    status: "vacant"
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await roomsAPI.getAll();
      setRooms(response.data || []);
    } catch (error) {
      console.error("Error loading rooms:", error);
      const { showError } = await import("../../components/DialogProvider");
      showError("Failed to load rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomsAPI.update(editingRoom._id, formData);
      } else {
        await roomsAPI.create(formData);
      }
      setShowForm(false);
      setEditingRoom(null);
      setFormData({ block: "A", roomNumber: "", floor: "", capacity: 4, occupants: 0, status: "vacant" });
      loadRooms();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save room");
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      block: room.block || "A",
      roomNumber: room.roomNumber,
      floor: room.floor,
      capacity: room.capacity,
      occupants: room.occupants,
      status: room.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const { showConfirm, showError, showSuccess } = await import("../../components/DialogProvider");
    const { showNotification } = await import("../../components/Notification");
    showConfirm(
      "Are you sure you want to delete this room?",
      async () => {
        try {
          await roomsAPI.delete(id);
          loadRooms();
          showSuccess("Room deleted successfully");
          showNotification("Room deleted", "success");
        } catch (error) {
          showError("Failed to delete room");
        }
      },
      "Delete Room"
    );
  };

  const filteredRooms = useMemo(() => {
    if (!rooms || !Array.isArray(rooms)) return [];
    if (!searchTerm) return rooms;
    const term = searchTerm.toLowerCase();
    return rooms.filter(r => {
      if (!r) return false;
      return (
        (r.roomNumber?.toString() || '').toLowerCase().includes(term) ||
        (r.block?.toString() || '').toLowerCase().includes(term) ||
        (r.floor?.toString() || '').includes(term) ||
        (r.status?.toString() || '').toLowerCase().includes(term)
      );
    });
  }, [rooms, searchTerm]);

  const totalPages = Math.max(1, Math.ceil((filteredRooms?.length || 0) / itemsPerPage));
  const paginatedRooms = useMemo(() => {
    if (!filteredRooms || filteredRooms.length === 0) return [];
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRooms.slice(start, start + itemsPerPage);
  }, [filteredRooms, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (loading) return <div className="admin-page"><p>Loading...</p></div>;

  return (
    <div className="admin-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h2>Room Management</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px 12px", minWidth: "200px" }}
            />
            <button onClick={() => { setShowForm(!showForm); setEditingRoom(null); setFormData({ block: "A", roomNumber: "", floor: "", capacity: 4, occupants: 0, status: "vacant" }); }}>
              {showForm ? "Cancel" : "+ Add Room"}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: "20px", padding: "20px" }}>
            <h3>{editingRoom ? "Edit Room" : "Add New Room"}</h3>
            <div className="form-grid" style={{ marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="Block (e.g., A)"
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Room Number"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Floor"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Occupants"
                value={formData.occupants}
                onChange={(e) => setFormData({ ...formData, occupants: e.target.value })}
                required
              />
              <select
                className="styled-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary">{editingRoom ? "Update" : "Create"}</button>
            </div>
          </form>
        )}

        <table className="admin-table">
          <thead>
            <tr>
              <th>Block</th>
              <th>Room Number</th>
              <th>Floor</th>
              <th>Capacity</th>
              <th>Occupants</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRooms.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#93c5fd" }}>
                  {searchTerm ? "No rooms found matching your search." : "No rooms found."}
                </td>
              </tr>
            ) : (
              paginatedRooms.map(room => (
                <tr key={room._id} className={room.status}>
                  <td style={{ color: "#ffffff" }}>{room.block || 'A'}</td>
                  <td style={{ color: "#ffffff" }}>{room.roomNumber || 'N/A'}</td>
                  <td style={{ color: "#ffffff" }}>{room.floor || 'N/A'}</td>
                  <td style={{ color: "#ffffff" }}>{room.capacity || 0}</td>
                  <td style={{ color: "#ffffff" }}>{room.occupants || 0}</td>
                  <td style={{ color: "#ffffff" }}>{room.status || 'N/A'}</td>
                  <td>
                    <button onClick={() => setViewRoom(room)} style={{ marginRight: "5px" }}>View Students</button>
                    <button onClick={() => handleEdit(room)} style={{ marginRight: "5px" }}>Edit</button>
                    <button onClick={() => handleDelete(room._id)}>Delete</button>
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
        {filteredRooms.length > 0 && (
          <div style={{ marginTop: "12px", color: "#93c5fd", fontSize: "0.9rem", textAlign: "center" }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRooms.length)} of {filteredRooms.length} rooms
          </div>
        )}

        {viewRoom && (
          <div className="modal-backdrop" onClick={() => setViewRoom(null)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setViewRoom(null)}>×</button>
              <h3>Room {viewRoom.roomNumber} – Students</h3>
              {(viewRoom.students && viewRoom.students.length > 0) ? (
                <ul style={{ marginTop: 12, color: '#ffffff', listStyle: 'none', padding: 0 }}>
                  {viewRoom.students.map(s => (
                    <li key={s._id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,.12)', color: '#e0f2fe' }}>
                      <strong style={{ color: '#ffffff' }}>{s.name}</strong> ({s.studentId}) {s.branch ? `– ${s.branch}` : ''} {s.year ? `– ${s.year}` : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ marginTop: 12, color: '#93c5fd' }}>No students assigned.</p>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
