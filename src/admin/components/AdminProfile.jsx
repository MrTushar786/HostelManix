import { useEffect, useState } from 'react';
import { usersAPI } from '../../utils/api';

export default function AdminProfile() {
  const [user, setUser] = useState({ displayName: '', email: '', photoUrl: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await usersAPI.getMe();
        setUser({ displayName: res.data.displayName || '', email: res.data.email || '', photoUrl: res.data.photoUrl || '' });
      } catch (e) {
        setError('Failed to load profile');
      }
    })();
  }, []);

  const onUpload = (file) => {
    const reader = new FileReader();
    reader.onload = () => setUser(prev => ({ ...prev, photoUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    try {
      setSaving(true);
      await usersAPI.updateMe(user);
      alert('Admin profile updated');
      document.dispatchEvent(new CustomEvent('admin-profile-updated'));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
        <h2>Admin Profile</h2>
        {error && <p style={{ color: '#fca5a5', marginBottom: 12 }}>{error}</p>}
        <div className="form-grid" style={{ alignItems: 'center' }}>
          <div>
            <img src={user.photoUrl || 'https://via.placeholder.com/120x120?text=A'} alt="avatar" style={{ width: 120, height: 120, borderRadius: '50%', border: '3px solid rgba(255,255,255,.25)' }} />
            <div style={{ marginTop: 12 }}>
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
            </div>
          </div>
          <div className="form-grid">
            <input placeholder="Display Name" value={user.displayName} onChange={(e) => setUser({ ...user, displayName: e.target.value })} />
            <input placeholder="Email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
    </div>
  );
}


