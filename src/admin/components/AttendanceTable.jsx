import { useState, useEffect, useMemo } from "react";
import { attendanceAPI, studentsAPI, roomsAPI } from "../../utils/api";
import { format, isSameDay } from "date-fns";
import "../../css/Dropdown.css";

export default function AttendanceAdmin() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomStudents, setRoomStudents] = useState([]);
  const [studentStatuses, setStudentStatuses] = useState({}); // Track individual student statuses
  const [bulkStatus, setBulkStatus] = useState("present");
  const [viewMode, setViewMode] = useState("rooms"); // "rooms" or "days"
  const [filterYear, setFilterYear] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [attendanceRes, studentsRes, roomsRes] = await Promise.all([
        attendanceAPI.getAll(),
        studentsAPI.getAll(),
        roomsAPI.getAll()
      ]);
      setAttendance(attendanceRes.data || []);
      setStudents(studentsRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Load students when room is selected
  useEffect(() => {
    if (selectedRoom) {
      loadRoomStudents(selectedRoom._id);
    }
  }, [selectedRoom]);

  // Initialize student statuses when room students or selected date changes
  useEffect(() => {
    if (roomStudents.length > 0) {
      const initialStatuses = {};
      roomStudents.forEach(student => {
        const attRecord = getAttendanceForStudent(student._id, selectedDate);
        initialStatuses[student.studentId] = attRecord ? attRecord.status : bulkStatus;
      });
      setStudentStatuses(initialStatuses);
    }
  }, [roomStudents, selectedDate, attendance]);

  const loadRoomStudents = async (roomId) => {
    try {
      const res = await studentsAPI.getByRoom(roomId);
      setRoomStudents(res.data || []);
    } catch (error) {
      console.error("Error loading room students:", error);
      setRoomStudents([]);
    }
  };

  // Group attendance by date
  const attendanceByDate = useMemo(() => {
    const grouped = {};
    attendance.forEach(record => {
      const dateKey = format(new Date(record.date), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(record);
    });
    return grouped;
  }, [attendance]);

  // Get sorted dates
  const sortedDates = useMemo(() => {
    return Object.keys(attendanceByDate).sort((a, b) => new Date(b) - new Date(a));
  }, [attendanceByDate]);

  // Get selected date attendance
  const selectedDateAttendance = useMemo(() => {
    return attendanceByDate[selectedDate] || [];
  }, [attendanceByDate, selectedDate]);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
  };

  const handleIndividualMarkAttendance = async (studentId, status) => {
    try {
      const response = await attendanceAPI.create({
        studentId,
        date: selectedDate,
        status
      });
      
      // Update local state immediately
      setStudentStatuses(prev => ({ ...prev, [studentId]: status }));
      
      // Update attendance array with the new/updated record
      setAttendance(prev => {
        const newRecord = response.data;
        if (!newRecord) return prev;
        
        const newStudentId = newRecord.studentId?.studentId || newRecord.studentId?._id?.toString();
        const existingIndex = prev.findIndex(a => {
          const attStudentId = a.studentId?.studentId || a.studentId?._id?.toString();
          const sameStudent = attStudentId === newStudentId;
          const sameDate = isSameDay(new Date(a.date), new Date(selectedDate));
          return sameStudent && sameDate;
        });
        
        if (existingIndex >= 0) {
          // Update existing record
          const updated = [...prev];
          updated[existingIndex] = newRecord;
          return updated;
        } else {
          // Add new record
          return [newRecord, ...prev];
        }
      });
      
      // Show success notification
      const { showNotification } = await import("../../components/Notification");
      const student = students.find(s => s.studentId === studentId || s._id?.toString() === studentId?.toString());
      const studentName = student?.name || "Student";
      showNotification(`Attendance marked as ${status} for ${studentName}`, "success");
    } catch (error) {
      const { showError } = await import("../../components/DialogProvider");
      const { showNotification } = await import("../../components/Notification");
      showError(error.response?.data?.message || "Failed to mark attendance");
      showNotification("Failed to mark attendance", "error");
    }
  };

  const handleBulkMarkAttendance = async () => {
    const { showWarning, showSuccess, showError } = await import("../../components/DialogProvider");
    const { showNotification } = await import("../../components/Notification");
    if (!selectedRoom || roomStudents.length === 0) {
      showWarning("Please select a room with students");
      return;
    }

    try {
      // Mark each student with their individual status from studentStatuses
      const promises = roomStudents.map(student => {
        const status = studentStatuses[student.studentId] || bulkStatus;
        return attendanceAPI.create({
          studentId: student.studentId,
          date: selectedDate,
          status
        });
      });
      
      await Promise.all(promises);
      showSuccess(`Attendance marked for ${roomStudents.length} students in Room ${selectedRoom.roomNumber}`);
      showNotification(`Attendance marked for ${roomStudents.length} students`, "success");
      loadData();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to mark attendance");
    }
  };

  const handleDelete = async (id) => {
    const { showConfirm, showError, showSuccess } = await import("../../components/DialogProvider");
    const { showNotification } = await import("../../components/Notification");
    showConfirm(
      "Are you sure you want to delete this attendance record?",
      async () => {
        try {
          await attendanceAPI.delete(id);
          loadData();
          showSuccess("Attendance record deleted successfully");
          showNotification("Attendance record deleted", "success");
        } catch (error) {
          showError("Failed to delete attendance record");
        }
      },
      "Delete Attendance Record"
    );
  };

  const getAttendanceForStudent = (studentId, date) => {
    return selectedDateAttendance.find(
      a => {
        const attStudentId = a.studentId?._id?.toString();
        const attStudentIdStr = a.studentId?.studentId;
        const searchId = studentId?.toString();
        return (attStudentId === searchId || attStudentIdStr === searchId) && 
               isSameDay(new Date(a.date), new Date(date));
      }
    );
  };

  // Filter rooms with students
  const roomsWithStudents = useMemo(() => {
    return rooms.filter(room => {
      const roomStuds = students.filter(s => s.roomId?._id?.toString() === room._id?.toString());
      return roomStuds.length > 0;
    });
  }, [rooms, students]);

  if (loading) return <div className="admin-page"><p>Loading...</p></div>;

  return (
      <div className="admin-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h2>Attendance Management</h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select className="styled-select" value={viewMode} onChange={(e) => setViewMode(e.target.value)} style={{ padding: "8px 12px" }}>
              <option value="rooms">Room-wise View</option>
              <option value="days">Day-wise View</option>
              </select>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: "8px 12px" }}
              />
          </div>
        </div>

        {/* Room-wise Attendance Marking */}
        {viewMode === "rooms" && (
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ marginBottom: "16px" }}>Mark Attendance by Room</h3>
            <div style={{ marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <span>Default Status:</span>
              <select className="styled-select" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} style={{ padding: "8px 12px" }}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
              <span style={{ color: "#93c5fd" }}>Selected Date: {format(new Date(selectedDate), "MMM dd, yyyy")}</span>
            </div>

            {selectedRoom ? (
              <div className="attendance-room-modal" style={{ 
                background: "rgba(255,255,255,0.12)", 
                border: "1px solid rgba(255,255,255,0.25)", 
                borderRadius: "16px", 
                padding: "20px",
                marginBottom: "20px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h4>Room {selectedRoom.roomNumber} - {selectedRoom.block || "A"} Block (Floor {selectedRoom.floor})</h4>
                  <button onClick={() => setSelectedRoom(null)}>Close</button>
                </div>
                {roomStudents.length === 0 ? (
                  <p>No students assigned to this room.</p>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                      {roomStudents.map(student => {
                        const attRecord = getAttendanceForStudent(student._id, selectedDate);
                        const currentStatus = studentStatuses[student.studentId] || (attRecord ? attRecord.status : bulkStatus);
                        const statusColor = currentStatus === "present" ? "#22c55e" : 
                                          currentStatus === "absent" ? "#ef4444" : "#f59e0b";
                        const statusBg = currentStatus === "present" ? "rgba(34,197,94,0.2)" : 
                                        currentStatus === "absent" ? "rgba(239,68,68,0.2)" : 
                                        "rgba(245,158,11,0.2)";
                        
                        return (
                          <div key={student._id} style={{
                            background: statusBg,
                            border: `1px solid ${statusColor}`,
                            borderRadius: "12px",
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px"
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontWeight: "700", fontSize: "1rem", color: "#fff" }}>{student.name}</div>
                                <div style={{ fontSize: "0.85rem", color: "#93c5fd" }}>{student.studentId}</div>
                              </div>
                              <div style={{ 
                                fontSize: "0.75rem", 
                                padding: "4px 12px", 
                                borderRadius: "8px",
                                background: statusColor,
                                color: "#fff",
                                fontWeight: "700"
                              }}>
                                {attRecord ? attRecord.status.toUpperCase() : "NO RECORD"}
                              </div>
                            </div>
                            
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStudentStatuses(prev => ({ ...prev, [student.studentId]: "present" }));
                                  handleIndividualMarkAttendance(student.studentId, "present");
                                }}
                                style={{
                                  flex: 1,
                                  padding: "8px 12px",
                                  background: currentStatus === "present" ? "#22c55e" : "rgba(34,197,94,0.3)",
                                  border: "1px solid #86efac",
                                  borderRadius: "8px",
                                  color: "#fff",
                                  fontWeight: "600",
                                  fontSize: "0.85rem",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                  if (currentStatus !== "present") {
                                    e.currentTarget.style.background = "rgba(34,197,94,0.5)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (currentStatus !== "present") {
                                    e.currentTarget.style.background = "rgba(34,197,94,0.3)";
                                  }
                                }}
                              >
                                ✓ Present
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStudentStatuses(prev => ({ ...prev, [student.studentId]: "absent" }));
                                  handleIndividualMarkAttendance(student.studentId, "absent");
                                }}
                                style={{
                                  flex: 1,
                                  padding: "8px 12px",
                                  background: currentStatus === "absent" ? "#ef4444" : "rgba(239,68,68,0.3)",
                                  border: "1px solid #fca5a5",
                                  borderRadius: "8px",
                                  color: "#fff",
                                  fontWeight: "600",
                                  fontSize: "0.85rem",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                  if (currentStatus !== "absent") {
                                    e.currentTarget.style.background = "rgba(239,68,68,0.5)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (currentStatus !== "absent") {
                                    e.currentTarget.style.background = "rgba(239,68,68,0.3)";
                                  }
                                }}
                              >
                                ✗ Absent
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStudentStatuses(prev => ({ ...prev, [student.studentId]: "late" }));
                                  handleIndividualMarkAttendance(student.studentId, "late");
                                }}
                                style={{
                                  flex: 1,
                                  padding: "8px 12px",
                                  background: currentStatus === "late" ? "#f59e0b" : "rgba(245,158,11,0.3)",
                                  border: "1px solid #fcd34d",
                                  borderRadius: "8px",
                                  color: "#fff",
                                  fontWeight: "600",
                                  fontSize: "0.85rem",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                  if (currentStatus !== "late") {
                                    e.currentTarget.style.background = "rgba(245,158,11,0.5)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (currentStatus !== "late") {
                                    e.currentTarget.style.background = "rgba(245,158,11,0.3)";
                                  }
                                }}
                              >
                                ⏱ Late
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <button 
                        onClick={handleBulkMarkAttendance}
                        style={{ 
                          flex: 1,
                          padding: "12px", 
                          fontWeight: "700",
                          background: "linear-gradient(135deg, rgba(96,165,250,0.3), rgba(59,130,246,0.3))",
                          border: "1px solid #60a5fa",
                          borderRadius: "12px",
                          color: "#fff"
                        }}
                      >
                        Save All Attendance for {format(new Date(selectedDate), "MMM dd, yyyy")}
                      </button>
                      <button
                        onClick={() => {
                          const newStatuses = {};
                          roomStudents.forEach(s => {
                            newStatuses[s.studentId] = bulkStatus;
                          });
                          setStudentStatuses(newStatuses);
                        }}
                        style={{
                          padding: "12px 20px",
                          fontWeight: "600",
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "12px",
                          color: "#fff"
                        }}
                      >
                        Set All to {bulkStatus.toUpperCase()}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
                gap: "12px" 
              }}>
                {roomsWithStudents.map(room => {
                  const roomStuds = students.filter(s => s.roomId?._id?.toString() === room._id?.toString());
                  const dateAtt = attendance.filter(a => {
                    const attDate = format(new Date(a.date), "yyyy-MM-dd");
                    return attDate === selectedDate && 
                      roomStuds.some(s => s._id?.toString() === a.studentId?._id?.toString());
                  });
                  const markedCount = dateAtt.length;
                  const presentCount = dateAtt.filter(a => a.status === "present").length;
                  
                  return (
                    <div
                      key={room._id}
                      onClick={() => handleRoomClick(room)}
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        borderRadius: "16px",
                        padding: "16px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 14px 28px rgba(0,0,0,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                      }}
                    >
                      <div style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "8px" }}>
                        Room {room.roomNumber}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#93c5fd", marginBottom: "8px" }}>
                        Block {room.block || "A"} • Floor {room.floor}
                      </div>
                      <div style={{ fontSize: "0.85rem", marginBottom: "4px" }}>
                        Students: {roomStuds.length}
                      </div>
                      <div style={{ fontSize: "0.85rem" }}>
                        Marked: {markedCount}/{roomStuds.length} 
                        {markedCount > 0 && (
                          <span style={{ color: presentCount === roomStuds.length ? "#86efac" : "#fca5a5" }}>
                            {" "}({presentCount} present)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Day-wise Attendance View */}
        {viewMode === "days" && (
          <div>
            <div style={{ marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <span>Filter by Year:</span>
              <select className="styled-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ padding: "8px 12px" }}>
                <option value="">All Years</option>
                {['1st Year','2nd Year','3rd Year','4th Year','Other'].map(y => 
                  <option key={y} value={y}>{y}</option>
                )}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {sortedDates.slice(0, 30).map(dateKey => {
                const dateRecords = attendanceByDate[dateKey].filter(r => 
                  !filterYear || (r.studentId?.year || "") === filterYear
                );
                
                if (dateRecords.length === 0) return null;

                const presentCount = dateRecords.filter(r => r.status === "present").length;
                const absentCount = dateRecords.filter(r => r.status === "absent").length;
                const lateCount = dateRecords.filter(r => r.status === "late").length;

                return (
                  <div
                    key={dateKey}
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: dateKey === selectedDate ? "2px solid #60a5fa" : "1px solid rgba(255,255,255,0.25)",
                      borderRadius: "16px",
                      padding: "20px",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                    onClick={() => setSelectedDate(dateKey)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <h4 style={{ margin: 0, marginBottom: "4px" }}>
                          {format(new Date(dateKey), "EEEE, MMMM dd, yyyy")}
                        </h4>
                        <div style={{ fontSize: "0.85rem", color: "#93c5fd" }}>
                          {dateRecords.length} attendance record{dateRecords.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "12px", fontSize: "0.85rem" }}>
                        <span style={{ color: "#86efac" }}>✓ {presentCount} Present</span>
                        <span style={{ color: "#fca5a5" }}>✗ {absentCount} Absent</span>
                        <span style={{ color: "#fcd34d" }}>⏱ {lateCount} Late</span>
                      </div>
                    </div>
                    
                    {dateKey === selectedDate && (
                      <div style={{ marginTop: "16px", maxHeight: "300px", overflowY: "auto" }}>
                        <table className="admin-table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th>Student</th>
                              <th>Status</th>
                              <th>Marked By</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dateRecords.map(record => (
                              <tr key={record._id} className={record.status}>
                                <td>
                                  {record.studentId?.name || "N/A"} 
                                  <div style={{ fontSize: "0.75rem", color: "#93c5fd" }}>
                                    ({record.studentId?.studentId || "N/A"})
                                  </div>
                                </td>
                                <td>
                                  <span style={{
                                    padding: "4px 12px",
                                    borderRadius: "8px",
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                    background: record.status === "present" ? "#22c55e" : 
                                              record.status === "absent" ? "#ef4444" : "#f59e0b",
                                    color: "#fff"
                                  }}>
                                    {record.status.toUpperCase()}
                                  </span>
                                </td>
                                <td>{record.markedBy?.username || "N/A"}</td>
                                <td>
                                  <button onClick={() => handleDelete(record._id)}>Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
}
