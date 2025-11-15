import { useEffect, useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import "../css/Attendance.css";
import Navbar from "./Navbar";
import { attendanceAPI } from "../utils/api";

export default function Attendance() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttendance = async (month) => {
    try {
      setLoading(true);
      setError("");
      const studentId = sessionStorage.getItem("studentId");
      if (!studentId) {
        setError("Missing student ID. Please log in again.");
        setRecords([]);
        return;
      }
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const res = await attendanceAPI.getByStudent(studentId, {
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
      });
      setRecords(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance(selectedMonth);
  }, [selectedMonth]);

  const attendanceData = useMemo(() => {
    const map = {};
    for (const r of records) {
      const key = format(new Date(r.date), "yyyy-MM-dd");
      const status = (r.status || "").toLowerCase();
      map[key] = status === "present" ? "Present" : status === "absent" ? "Absent" : status === "late" ? "Late" : "Present";
    }
    return map;
  }, [records]);

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const totalDays = monthDays.length;
  const presentCount = Object.values(attendanceData).filter(s => s === "Present").length;
  const absentCount = Object.values(attendanceData).filter(s => s === "Absent").length;
  const lateCount = Object.values(attendanceData).filter(s => s === "Late").length;
  const totalRecords = Object.values(attendanceData).length;
  const denom = totalRecords > 0 ? totalRecords : totalDays; // prefer actual records
  const attendanceRate = denom > 0 ? Math.round((presentCount / denom) * 100) : 0;

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDateStatus = attendanceData[selectedDateKey] || "No Record";

  return (
    <>
      <Navbar />
      <div className="attendance-page">

        {/* Background */}
        <div className="bg-gradient"></div>
        <div className="particles"></div>

        {/* Header */}
        <header className="page-header">
          <h1>Attendance</h1>
          <p>Your presence, beautifully tracked</p>
        </header>

        <div className="glass-container">
          {/* Summary Bar */}
          <section className="summary-bar">
            <div className="bar-container">
              <div className="bar present" style={{ width: `${denom ? (presentCount / denom) * 100 : 0}%` }}></div>
              <div className="bar absent" style={{ width: `${denom ? (absentCount / denom) * 100 : 0}%` }}></div>
              <div className="bar late" style={{ width: `${denom ? (lateCount / denom) * 100 : 0}%` }}></div>
            </div>
            <div className="labels">
              <span>Present ({presentCount})</span>
              <span>Absent ({absentCount})</span>
              <span>Late ({lateCount})</span>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="stats-grid">
            <div className="stat present">
              <span className="value">{presentCount}</span>
              <span className="label">Present</span>
            </div>
            <div className="stat absent">
              <span className="value">{absentCount}</span>
              <span className="label">Absent</span>
            </div>
            <div className="stat late">
              <span className="value">{lateCount}</span>
              <span className="label">Late</span>
            </div>
            <div className="stat rate">
              <span className="value">{attendanceRate}%</span>
              <span className="label">Rate</span>
            </div>
          </section>


          {error && (
            <p className="alert error" role="alert" style={{ margin: '0.5rem 0' }}>{error}</p>
          )}

          {/* Selected Date */}
          <section className="selected-date">
            <div className="date-info">
              <h2>{format(selectedDate, "EEEE")}</h2>
              <p>{format(selectedDate, "MMMM d, yyyy")}</p>
            </div>
            <div className={`status-badge ${selectedDateStatus.toLowerCase().replace(" ", "-")}`}>
              {selectedDateStatus}
            </div>
          </section>

          {/* Month Nav + Calendar */}
          <section className="calendar-section">
            <div className="month-nav">
              <button onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}>
                Prev
              </button>
              <h3>{format(selectedMonth, "MMMM yyyy")}</h3>
              <button onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}>
                Next
              </button>
            </div>

            <div className="calendar-grid">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="day-label">{d}</div>
              ))}
              {Array.from({ length: monthStart.getDay() }, (_, i) => (
                <div key={`empty-${i}`} className="day empty" />
              ))}
              {monthDays.map(date => {
                const key = format(date, "yyyy-MM-dd");
                const status = attendanceData[key];
                const isSelected = key === selectedDateKey;
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={key}
                    className={`day ${status?.toLowerCase() || "no-record"} ${isSelected ? "selected" : ""} ${isTodayDate ? "today" : ""}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="num">{format(date, "d")}</span>
                    {loading ? null : (status && <div className="dot"></div>)}
                  </div>
                );
              })}
            </div>
          </section>

        </div>


      </div>
    </>
  );
} 