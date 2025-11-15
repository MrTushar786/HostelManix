import { useEffect, useState, useMemo } from "react";
import { authAPI, roomsAPI, studentsAPI } from "../../utils/api";
import Pagination from "./Pagination";
import "../../css/Dropdown.css";

export default function StudentAdmin() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [formUser, setFormUser] = useState({ username: "", password: "" });
  const [formStudent, setFormStudent] = useState({
    studentId: "",
    name: "",
    email: "",
    phone: "",
    guardianName: "",
    address: "",
    photoUrl: "",
    year: "",
    branch: "",
    roomId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [studentsRes, roomsRes] = await Promise.all([
        studentsAPI.getAll(),
        roomsAPI.getAll(),
      ]);
      setStudents(studentsRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (e) {
      setError("Failed to load students/rooms");
      setStudents([]);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormUser({ username: "", password: "" });
    setFormStudent({ studentId: generateStudentId(), name: "", email: "", phone: "", guardianName: "", address: "", photoUrl: "", year: "", branch: "", roomId: "" });
  };

  const generateStudentId = () => {
    const prefix = "STU";
    const rand = Math.floor(100 + Math.random() * 900);
    const epoch = Date.now().toString().slice(-3);
    return `${prefix}${rand}${epoch}`; // e.g., STU456987
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await studentsAPI.update(editing._id, formStudent);
      } else {
        // 1) Create login user with role student
        const reg = await authAPI.register(
          formUser.username,
          formUser.password,
          "student",
          formStudent.studentId
        );
        const userId = reg.data?.userId;
        // 2) Create student profile
        await studentsAPI.create({ ...formStudent, userId });
      }
      resetForm();
      setShowForm(false);
      await loadData();
      const { showSuccess } = await import("../../components/DialogProvider");
      const { showNotification } = await import("../../components/Notification");
      showSuccess(editing ? "Student updated successfully" : "Student created successfully");
      showNotification(editing ? "Student updated" : "Student created", "success");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save student");
    }
  };

  const onEdit = (s) => {
    setEditing(s);
    setShowForm(true);
    setFormStudent({
      studentId: s.studentId || "",
      name: s.name || "",
      email: s.email || "",
      phone: s.phone || "",
      guardianName: s.guardianName || "",
      address: s.address || "",
      photoUrl: s.photoUrl || "",
      year: s.year || "",
      branch: s.branch || "",
      roomId: s.roomId?._id || "",
    });
    setFormUser({ username: "", password: "" });
  };

  const onDelete = async (id) => {
    const { showConfirm, showError, showSuccess } = await import("../../components/DialogProvider");
    const { showNotification } = await import("../../components/Notification");
    showConfirm(
      "Are you sure you want to delete this student? This action cannot be undone.",
      async () => {
        try {
          await studentsAPI.delete(id);
          await loadData();
          showSuccess("Student deleted successfully");
          showNotification("Student deleted", "success");
        } catch {
          showError("Failed to delete student");
        }
      },
      "Delete Student"
    );
  };

  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    if (!searchTerm) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(s => {
      if (!s) return false;
      return (
        (s.name?.toString() || '').toLowerCase().includes(term) ||
        (s.studentId?.toString() || '').toLowerCase().includes(term) ||
        (s.email?.toString() || '').toLowerCase().includes(term) ||
        (s.phone?.toString() || '').includes(term) ||
        (s.roomId?.roomNumber?.toString() || '').toLowerCase().includes(term) ||
        (s.branch?.toString() || '').toLowerCase().includes(term) ||
        (s.year?.toString() || '').includes(term)
      );
    });
  }, [students, searchTerm]);

  const totalPages = Math.max(1, Math.ceil((filteredStudents?.length || 0) / itemsPerPage));
  const paginatedStudents = useMemo(() => {
    if (!filteredStudents || filteredStudents.length === 0) return [];
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (loading) return <div className="admin-page"><p>Loading...</p></div>;

  return (
    <div className="admin-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h2>Students Management</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px 12px", minWidth: "200px" }}
            />
            <button onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}>
              {showForm ? "Cancel" : "+ Add Student"}
            </button>
          </div>
        </div>

        {error && <p style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</p>}

        {showForm && (
          <form onSubmit={onSubmit} style={{ marginBottom: 20, padding: 20 }}>
            <h3>{editing ? "Edit Student" : "Add New Student"}</h3>
            <div className="form-grid" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ flex: 1 }} placeholder="Student ID" value={formStudent.studentId} onChange={(e) => setFormStudent({ ...formStudent, studentId: e.target.value })} required />
                {!editing && (
                  <button type="button" onClick={() => setFormStudent({ ...formStudent, studentId: generateStudentId() })}>Regenerate</button>
                )}
              </div>
              <input placeholder="Name" value={formStudent.name} onChange={(e) => setFormStudent({ ...formStudent, name: e.target.value })} required />
              <input placeholder="Email" value={formStudent.email} onChange={(e) => setFormStudent({ ...formStudent, email: e.target.value })} />
              <input placeholder="Phone" value={formStudent.phone} onChange={(e) => setFormStudent({ ...formStudent, phone: e.target.value })} />
              <input placeholder="Guardian Name" value={formStudent.guardianName} onChange={(e) => setFormStudent({ ...formStudent, guardianName: e.target.value })} />
              <input placeholder="Address" value={formStudent.address} onChange={(e) => setFormStudent({ ...formStudent, address: e.target.value })} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={formStudent.photoUrl || 'https://via.placeholder.com/56x56?text=U'} alt="avatar" style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(255,255,255,.25)' }} />
                  <input type="file" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => setFormStudent(prev => ({ ...prev, photoUrl: reader.result }));
                    reader.readAsDataURL(f);
                  }} />
                </div>
              </div>
              <select className="styled-select" value={formStudent.roomId} onChange={(e) => setFormStudent({ ...formStudent, roomId: e.target.value })}>
                <option value="">Assign Room (optional)</option>
                {rooms.map(r => (
                  <option key={r._id} value={r._id}>{r.roomNumber} (Floor {r.floor})</option>
                ))}
              </select>
              <select className="styled-select" value={formStudent.year} onChange={(e) => setFormStudent({ ...formStudent, year: e.target.value })}>
                <option value="">Select Year</option>
                {['1st Year','2nd Year','3rd Year','4th Year','Other'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <input placeholder="Branch (e.g., B.Tech CSE)" value={formStudent.branch} onChange={(e) => setFormStudent({ ...formStudent, branch: e.target.value })} />
              {!editing && (
                <>
                  <input placeholder="Login Username" value={formUser.username} onChange={(e) => setFormUser({ ...formUser, username: e.target.value })} required />
                  <input type="password" placeholder="Login Password" value={formUser.password} onChange={(e) => setFormUser({ ...formUser, password: e.target.value })} required />
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ width: 'auto' }}>{editing ? "Update" : "Create"}</button>
            </div>
          </form>
        )}

        <table className="admin-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Student ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Room</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#93c5fd" }}>
                  {searchTerm ? "No students found matching your search." : "No students found."}
                </td>
              </tr>
            ) : (
              paginatedStudents.map(s => (
                <tr key={s._id}>
                  <td style={{ color: "#ffffff" }}>{s.photoUrl ? <img src={s.photoUrl} alt="" className="avatar" style={{ width: 36, height: 36, borderRadius: '50%' }} /> : '-'}</td>
                  <td style={{ color: "#ffffff" }}>{s.name || 'N/A'}</td>
                  <td style={{ color: "#ffffff" }}>{s.studentId || 'N/A'}</td>
                  <td style={{ color: "#ffffff" }}>{s.email || '-'}</td>
                  <td style={{ color: "#ffffff" }}>{s.phone || '-'}</td>
                  <td style={{ color: "#ffffff" }}>{s.roomId?.roomNumber || '-'}</td>
                  <td>
                    <button onClick={() => onEdit(s)} style={{ marginRight: 5 }}>Edit</button>
                    <button onClick={() => onDelete(s._id)}>Delete</button>
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
        {filteredStudents.length > 0 && (
          <div style={{ marginTop: "12px", color: "#93c5fd", fontSize: "0.9rem", textAlign: "center" }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
          </div>
        )}
    </div>
  );
}


