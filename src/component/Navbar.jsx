import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { studentsAPI } from "../utils/api";
import "../css/Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (sessionStorage.getItem('role') === 'student') {
          const me = await studentsAPI.getMe();
          setAvatar(me.data.photoUrl || "");
        }
      } catch {}
    };
    load();
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const onLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('studentId');
    window.location.href = '/';
  }
  return (
    <nav className="navbar">
        <div className="navbar-logo">
            <h3>HostelManix</h3>
        </div>
        <div className="navbar-links">
          <Link to="/student" className="nav-link">Home</Link>
          <Link to="/leave" className="nav-link">Leave Application</Link>
          <Link to="/attendance" className="nav-link">Attendance</Link>
          <Link to="/complaint" className="nav-link">Complaint</Link>

          <div ref={menuRef} style={{ position: 'relative' }}>
            <button className="nav-link" onClick={() => setOpen(v => !v)} style={{ padding: 0, borderRadius: '9999px' }}>
              <img src={avatar || 'https://via.placeholder.com/40x40?text=U'} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,255,255,.6)' }} />
            </button>
            {open && (
              <div style={{ position: 'absolute', right: 0, top: '120%', background: 'rgba(37,99,235,0.95)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 12, padding: 12, minWidth: 180, boxShadow: '0 12px 32px rgba(0,0,0,.25)', backdropFilter: 'blur(12px)', zIndex: 50 }}>
                <Link to="/profile" className="nav-link" onClick={() => setOpen(false)} style={{ display: 'block' }}>Profile</Link>
                <button onClick={onLogout} className="nav-link-red" style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', marginTop: 6 }}>Logout</button>
              </div>
            )}
          </div>
        </div>
    </nav>
  );
}
