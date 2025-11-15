import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import '../css/Student.css';
import { studentsAPI, usersAPI } from '../utils/api';

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', guardianName: '', address: '', photoUrl: '', year: '', branch: '', roomId: null });
  const [myRoom, setMyRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await studentsAPI.getMe();
        setProfile({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          guardianName: res.data.guardianName || '',
          address: res.data.address || '',
          photoUrl: res.data.photoUrl || '',
          year: res.data.year || '',
          branch: res.data.branch || '',
          roomId: res.data.roomId || null
        });
        if (res.data.roomId) {
          setMyRoom(res.data.roomId);
        }
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onChange = (e) => setProfile(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSave = async () => {
    try {
      setSaving(true);
      setError('');
      await studentsAPI.updateMe(profile);
      const { showSuccess } = await import("../components/DialogProvider");
      const { showNotification } = await import("../components/Notification");
      showSuccess('Profile updated successfully');
      showNotification('Profile updated', 'success');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (file) => {
    try {
      if (cloudName && uploadPreset) {
        const form = new FormData();
        form.append('file', file);
        form.append('upload_preset', uploadPreset);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form });
        const data = await res.json();
        if (data.secure_url) setProfile(p => ({ ...p, photoUrl: data.secure_url }));
        return;
      }
      // Fallback: store data URL directly for dev environments without Cloudinary
      const reader = new FileReader();
      reader.onload = () => setProfile(p => ({ ...p, photoUrl: reader.result }));
      reader.readAsDataURL(file);
    } catch (e) {
      setError('Failed to upload image');
    }
  };

  const onChangePassword = async () => {
    if (!pw.newPassword || pw.newPassword !== pw.confirm) {
      alert('Passwords do not match');
      return;
    }
    try {
      await usersAPI.changePassword(pw.currentPassword, pw.newPassword);
      alert('Password updated');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard" style={{ overflowY: 'auto' }}>
        <div className="dashboard-header">
          <h1>My Profile</h1>
          <p>Manage your personal information</p>
        </div>
        <div className="dashboard-main">
          <section className="action-section" style={{ gridColumn: '1 / -1' }}>
            {error && <p className="alert error" style={{ marginBottom: 12 }}>{error}</p>}
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 160, height: 160, borderRadius: '50%', border: '3px solid rgba(255,255,255,.25)', overflow: 'hidden', margin: '0 auto' }}>
                    <img src={profile.photoUrl || 'https://via.placeholder.com/160x160?text=Photo'} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <input name="name" placeholder="Full Name" value={profile.name} onChange={onChange} />
                    <input name="email" placeholder="Email" value={profile.email} onChange={onChange} />
                    <input name="phone" placeholder="Phone" value={profile.phone} onChange={onChange} />
                    <input name="guardianName" placeholder="Guardian Name" value={profile.guardianName} onChange={onChange} />
                    <input name="address" placeholder="Address" style={{ gridColumn: '1 / -1' }} value={profile.address} onChange={onChange} />
                    <select name="year" value={profile.year} onChange={onChange}>
                      <option value="">Select Year</option>
                      {['1st Year','2nd Year','3rd Year','4th Year','Other'].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <input name="branch" placeholder="Branch (e.g., B.Tech CSE)" value={profile.branch} onChange={onChange} />
                    {myRoom && (
                      <div style={{
                        gridColumn: '1 / -1',
                        padding: '12px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '2px solid #86efac',
                        borderRadius: '12px',
                        marginTop: '8px'
                      }}>
                        <strong style={{ color: '#86efac' }}>
                          🏠 Assigned Room: Block {myRoom.block || 'A'}-{myRoom.roomNumber} (Floor {myRoom.floor})
                        </strong>
                        <div style={{ fontSize: '0.85rem', color: '#93c5fd', marginTop: '4px' }}>
                          Capacity: {myRoom.occupants}/{myRoom.capacity} • Status: {myRoom.status}
                        </div>
                      </div>
                    )}
                    {!myRoom && (
                      <div style={{
                        gridColumn: '1 / -1',
                        padding: '12px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '2px solid #fca5a5',
                        borderRadius: '12px',
                        marginTop: '8px'
                      }}>
                        <span style={{ color: '#fca5a5' }}>
                          ⚠ No room assigned. Please contact admin.
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="chart-section" style={{ gridColumn: '1 / -1' }}>
            <h2>Change Password</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <input type="password" placeholder="Current Password" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} />
              <input type="password" placeholder="New Password" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} />
              <input type="password" placeholder="Confirm New Password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} />
            </div>
            <div style={{ marginTop: 12 }}>
              <button onClick={onChangePassword}>Update Password</button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}


