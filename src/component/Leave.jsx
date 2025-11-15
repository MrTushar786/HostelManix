import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Leave.css";
import Navbar from "./Navbar";
import { leavesAPI, studentsAPI } from "../utils/api";

export default function Leave() {
  const navigate = useNavigate();

  const TOTAL_LEAVES = 90;

  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usedLeaves, setUsedLeaves] = useState(0);
  const [remaining, setRemaining] = useState(TOTAL_LEAVES);

  const [form, setForm] = useState({
    name: "", hostelNo: "", leaveType: "", visitPlace: "",
    startDate: "", startTime: "", endDate: "", endTime: "",
    reason: "", mobile: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [popupLeave, setPopupLeave] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // === LOAD LEAVE HISTORY FROM API ===
  useEffect(() => {
    loadLeaves();
    // Prefill profile data
    (async () => {
      try {
        const me = await studentsAPI.getMe();
        setForm(prev => ({ ...prev, name: me.data.name || prev.name, mobile: me.data.phone || prev.mobile, hostelNo: me.data.studentId || prev.hostelNo }));
      } catch {}
    })();
    setIsLoaded(true);
  }, []);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const studentId = sessionStorage.getItem("studentId");
      if (studentId) {
        const response = await leavesAPI.getByStudent(studentId);
        setLeaveHistory(response.data);
        
        // Calculate used leaves
        const totalUsed = response.data
          .filter(l => l.status === "Approved" || l.status === "Pending")
          .reduce((sum, l) => sum + (l.days || 0), 0);
        setUsedLeaves(totalUsed);
        setRemaining(TOTAL_LEAVES - totalUsed);
      }
    } catch (error) {
      console.error("Error loading leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  // === BALANCE (After this request) ===
  const [balance, setBalance] = useState(remaining);

  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(`${form.startDate}T${form.startTime || "00:00"}`);
      const end = new Date(`${form.endDate}T${form.endTime || "23:59"}`);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      const requestedDays = Math.max(0, diffDays);
      setBalance(remaining - requestedDays);
    } else {
      setBalance(remaining);
    }
  }, [form.startDate, form.startTime, form.endDate, form.endTime, remaining]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const num = value.replace(/\D/g, "").slice(0, 10);
      setForm(prev => ({ ...prev, [name]: num }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    const { name, hostelNo, leaveType, visitPlace, startDate, startTime, endDate, endTime, reason, mobile } = form;
    if (!name || !hostelNo || !leaveType || !visitPlace || !startDate || !startTime || !endDate || !endTime || !reason || !mobile) {
      setError("All fields required");
      return;
    }
    if (new Date(`${endDate}T${endTime}`) < new Date(`${startDate}T${startTime}`)) {
      setError("End time before start");
      return;
    }
    if (mobile.length !== 10) {
      setError("Invalid mobile");
      return;
    }
    if (balance < 0) {
      setError("Not enough leave balance");
      return;
    }

    const start = new Date(`${startDate}T${startTime || "00:00"}`);
    const end = new Date(`${endDate}T${endTime || "23:59"}`);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const days = Math.max(0, diffDays);

    try {
      await leavesAPI.create({
        name,
        hostelNo,
        leaveType,
        visitPlace,
        startDate: start.toISOString(),
        startTime,
        endDate: end.toISOString(),
        endTime,
        reason,
        mobile,
        days
      });
      setSuccess("Applied!");
      loadLeaves();
      setTimeout(() => navigate("/student"), 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit leave request");
    }
  };

  const displayedLeaves = showAll ? leaveHistory : leaveHistory.slice(0, 3);
  const hasMore = leaveHistory.length > 3;

  return (
    <>
      <Navbar />
      <div className={`leave-final ${isLoaded ? 'loaded' : ''}`}>

        {/* Background */}
        <div className="gradient-bg"></div>
        <div className="particles"></div>

        {/* Header */}
        <header className="header">
          <h1>Leave Application</h1>
          <div className="balance">
            <span>Total: <strong className="neon">{TOTAL_LEAVES}</strong></span>
            <span>Remaining: <strong className={remaining >= 0 ? "good" : "low"}>{remaining}</strong></span>
          </div>
        </header>

        {/* Form Card */}
        <main className="form-card">
          <div className="form-grid">
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
            <input name="hostelNo" placeholder="Hostel No." value={form.hostelNo} onChange={handleChange} />

            <div className="select" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {form.leaveType || "Leave Type"} Down Arrow
              {isDropdownOpen && (
                <div className="options">
                  {["Day", "Night", "Visit"].map(t => (
                    <div key={t} onClick={() => { setForm(prev => ({ ...prev, leaveType: t })); setIsDropdownOpen(false); }}>{t}</div>
                  ))}
                </div>
              )}
            </div>
            <input name="visitPlace" placeholder="Visit Place" value={form.visitPlace} onChange={handleChange} />

            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
            <input type="time" name="startTime" value={form.startTime} onChange={handleChange} />
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
            <input type="time" name="endTime" value={form.endTime} onChange={handleChange} />

            <textarea name="reason" placeholder="Reason..." value={form.reason} onChange={handleChange} rows={2} />
            <input name="mobile" placeholder="Mobile" value={form.mobile} onChange={handleChange} maxLength={10} />
          </div>

          {error && <p className="alert error">{error}</p>}
          {success && <p className="alert success">{success}</p>}

          <div className="buttons">
            <button onClick={handleSubmit} className="submit">Submit</button>
            <button onClick={() => navigate("/student")} className="back">Back</button>
          </div>
        </main>

        {/* Status Bar with Load More */}
        {leaveHistory.length > 0 && (
          <section className="status-bar">
            <h3>Your Requests</h3>
            <div className="status-list">
              {displayedLeaves.map(leave => (
                <div key={leave._id || leave.id} className="status-item" onClick={() => setPopupLeave(leave)}>
                  <span>{leave.leaveType} • {leave.visitPlace} • {new Date(leave.startDate).toLocaleDateString()}</span>
                  <span className={`tag ${leave.status.toLowerCase()}`}>{leave.status}</span>
                </div>
              ))}
              {hasMore && (
                <div
                  className="load-more"
                  onClick={() => setShowAll(!showAll)}
                  style={{
                    cursor: "pointer",
                    textAlign: "center",
                    marginTop: "0.5rem",
                    color: "#60a5fa",
                    fontWeight: "600",
                    fontSize: "0.9rem"
                  }}
                >
                  {showAll ? "Show Less" : `+${leaveHistory.length - 3} more`}
                </div>
              )}
            </div>
          </section>
        )}

        {/* CENTERED POPUP */}
        {popupLeave && (
          <div className="modal-backdrop" onClick={() => setPopupLeave(null)}>
            <div className="modal-center" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setPopupLeave(null)}>×</button>
              <h3>Leave Details</h3>
              <div className="details">
                {Object.entries(popupLeave)
                  .filter(([k]) => k !== "id")
                  .map(([key, value]) => (
                    <p key={key}>
                      <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>
                      <span>{value}</span>
                    </p>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}