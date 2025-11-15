import { useEffect, useState } from "react";
import { messMenuAPI } from "../../utils/api";
import { showConfirm, showError, showSuccess } from "../../components/DialogProvider";
import { showNotification } from "../../components/Notification";

export default function MessMenuAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDay, setEditingDay] = useState("");
  const [form, setForm] = useState({ day: "Monday", special: false, breakfast: "", lunch: "", dinner: "" });

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await messMenuAPI.getAll();
      setItems(res.data || []);
    } catch (e) {
      setError("Failed to load mess menu");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDay) {
        await messMenuAPI.update(editingDay, form);
      } else {
        await messMenuAPI.create(form);
      }
      setShowForm(false);
      setEditingDay("");
      setForm({ day: "Monday", special: false, breakfast: "", lunch: "", dinner: "" });
      await load();
      showSuccess(editingDay ? "Menu updated successfully" : "Menu created successfully");
      showNotification(editingDay ? "Menu updated" : "Menu created", "success");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to save menu");
    }
  };

  const onEdit = (it) => {
    setEditingDay(it.day);
    setForm({ day: it.day, special: !!it.special, breakfast: it.breakfast, lunch: it.lunch, dinner: it.dinner });
    setShowForm(true);
  };

  const onDelete = async (day) => {
    showConfirm(
      `Are you sure you want to delete the menu for ${day}?`,
      async () => {
        try {
          await messMenuAPI.delete(day);
          await load();
          showSuccess("Menu deleted successfully");
          showNotification("Menu deleted", "success");
        } catch {
          showError("Failed to delete menu");
        }
      },
      "Delete Menu"
    );
  };

  if (loading) return <div className="admin-page"><p style={{ color: "#ffffff" }}>Loading...</p></div>;

  return (
    <div className="admin-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ color: "#ffffff" }}>Mess Menu Management</h2>
          <button onClick={() => { setShowForm(!showForm); if (!showForm) { setEditingDay(""); setForm({ day: "Monday", special: false, breakfast: "", lunch: "", dinner: "" }); } }}>
            {showForm ? "Cancel" : "+ Add / Edit Day"}
          </button>
        </div>

        {error && <p style={{ color: "#fca5a5", marginBottom: 12 }}>{error}</p>}

        {showForm && (
          <form onSubmit={onSubmit} style={{ marginBottom: 20, padding: 20, background: "#f5f5f5", borderRadius: 8 }}>
            <h3>{editingDay ? `Edit ${editingDay}` : "Add Day"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} disabled={!!editingDay}>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.special} onChange={(e) => setForm({ ...form, special: e.target.checked })} />
                Special Day
              </label>
              <input placeholder="Breakfast" value={form.breakfast} onChange={(e) => setForm({ ...form, breakfast: e.target.value })} required />
              <input placeholder="Lunch" value={form.lunch} onChange={(e) => setForm({ ...form, lunch: e.target.value })} required />
              <input placeholder="Dinner" value={form.dinner} onChange={(e) => setForm({ ...form, dinner: e.target.value })} required />
            </div>
            <button type="submit">{editingDay ? "Update" : "Create"}</button>
          </form>
        )}

        <table className="admin-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Special</th>
              <th>Breakfast</th>
              <th>Lunch</th>
              <th>Dinner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.day}>
                <td style={{ color: "#ffffff" }}>{it.day}</td>
                <td style={{ color: "#ffffff" }}>{it.special ? 'Yes' : 'No'}</td>
                <td style={{ color: "#ffffff" }}>{it.breakfast}</td>
                <td style={{ color: "#ffffff" }}>{it.lunch}</td>
                <td style={{ color: "#ffffff" }}>{it.dinner}</td>
                <td>
                  <button onClick={() => onEdit(it)} style={{ marginRight: 5 }}>Edit</button>
                  <button onClick={() => onDelete(it.day)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}


