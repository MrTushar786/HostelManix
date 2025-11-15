import React, { useEffect, useRef, useState } from "react";
import "../css/Admin.css";
import { usersAPI } from "../../utils/api";

export default function Anavbar() {
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await usersAPI.getMe();
        setAvatar(res.data.photoUrl || "");
      } catch {}
    })();
    const onDocClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', onDocClick);
    const onUpdated = async () => {
      try { const res = await usersAPI.getMe(); setAvatar(res.data.photoUrl || ""); } catch {}
    };
    document.addEventListener('admin-profile-updated', onUpdated);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const onLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('studentId');
    window.location.href = '/';
  };
  return (
    <nav className="admin-navbar">
      <h1>HostelManix Admin</h1>
      <div className="admin-user" ref={menuRef}>
        <span>Admin</span>
        <button className="nav-link" onClick={() => setOpen(v => !v)} style={{ padding: 0, borderRadius: '9999px' }}>
          <img src={avatar || '/admin-icon.png'} alt="Admin" className="admin-avatar" />
        </button>
        {open && (
          <div style={{ position: 'absolute', right: 16, top: 64, background: 'rgba(37,99,235,0.95)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 12, padding: 12, minWidth: 180, boxShadow: '0 12px 32px rgba(0,0,0,.25)', backdropFilter: 'blur(12px)', zIndex: 50 }}>
            <a href="/admin/profile" className="nav-link" onClick={() => setOpen(false)} style={{ display: 'block' }}>Profile</a>
            <button onClick={onLogout} className="nav-link-red" style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', marginTop: 6 }}>Logout</button>
          </div>
        )}
      </div>
    </nav>
    
  );
}
