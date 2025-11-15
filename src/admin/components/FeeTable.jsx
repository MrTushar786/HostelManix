import { useState, useEffect, useMemo } from "react";
import { feesAPI, studentsAPI } from "../../utils/api";
import { showConfirm, showError, showSuccess, showWarning } from "../../components/DialogProvider";
import { showNotification } from "../../components/Notification";
import Pagination from "./Pagination";
import "../../css/Dropdown.css";

export default function FeeAdmin() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [formData, setFormData] = useState({
    studentId: "",
    amount: "",
    dueDate: "",
    status: "pending"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feesRes, studentsRes] = await Promise.all([
        feesAPI.getAll(),
        studentsAPI.getAll()
      ]);
      setFees(feesRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const student = students.find(s => s._id === formData.studentId);
      if (!student) {
        showWarning("Please select a student");
        return;
      }

      if (editingFee) {
        await feesAPI.update(editingFee._id, formData);
      } else {
        await feesAPI.create({ ...formData, studentId: student._id });
      }
      setShowForm(false);
      setEditingFee(null);
      setFormData({ studentId: "", amount: "", dueDate: "", status: "pending" });
      loadData();
      showSuccess(editingFee ? "Fee updated successfully" : "Fee created successfully");
      showNotification(editingFee ? "Fee updated" : "Fee created", "success");
    } catch (error) {
      showError(error.response?.data?.message || "Failed to save fee");
    }
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setFormData({
      studentId: fee.studentId._id || fee.studentId,
      amount: fee.amount,
      dueDate: fee.dueDate.split('T')[0],
      status: fee.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    showConfirm(
      "Are you sure you want to delete this fee?",
      async () => {
        try {
          await feesAPI.delete(id);
          loadData();
          showSuccess("Fee deleted successfully");
          showNotification("Fee deleted", "success");
        } catch (error) {
          showError("Failed to delete fee");
        }
      },
      "Delete Fee"
    );
  };

  const handleMarkPaid = async (id) => {
    try {
      await feesAPI.update(id, { status: "paid", paidDate: new Date() });
      loadData();
      showSuccess("Fee marked as paid successfully");
      showNotification("Fee marked as paid", "success");
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update fee");
    }
  };

  const filteredFees = useMemo(() => {
    if (!searchTerm) return fees;
    const term = searchTerm.toLowerCase();
    return fees.filter(f => 
      f.studentId?.name?.toLowerCase().includes(term) ||
      f.studentId?.studentId?.toLowerCase().includes(term) ||
      f.status?.toLowerCase().includes(term) ||
      f.amount?.toString().includes(term)
    );
  }, [fees, searchTerm]);

  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
  const paginatedFees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFees.slice(start, start + itemsPerPage);
  }, [filteredFees, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (loading) return <div className="admin-page"><p style={{ color: "#ffffff" }}>Loading...</p></div>;

  return (
    <div className="admin-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h2 style={{ color: "#ffffff" }}>Fee Management</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search fees..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px 12px", minWidth: "200px", color: "#ffffff" }}
            />
            <button onClick={() => { setShowForm(!showForm); setEditingFee(null); setFormData({ studentId: "", amount: "", dueDate: "", status: "pending" }); }}>
              {showForm ? "Cancel" : "+ Add Fee"}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: "20px", padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
            <h3>{editingFee ? "Edit Fee" : "Add New Fee"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <select
                className="styled-select"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
              >
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <input
                type="date"
                placeholder="Due Date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
              <select
                className="styled-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <button type="submit">{editingFee ? "Update" : "Create"}</button>
          </form>
        )}

        <table className="admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFees.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#93c5fd" }}>
                  {searchTerm ? "No fees found matching your search." : "No fees found."}
                </td>
              </tr>
            ) : (
              paginatedFees.map(fee => (
                <tr key={fee._id} className={fee.status}>
                  <td style={{ color: "#ffffff" }}>{fee.studentId?.name || "N/A"} ({fee.studentId?.studentId || "N/A"})</td>
                  <td style={{ color: "#ffffff" }}>₹{fee.amount?.toLocaleString()}</td>
                  <td style={{ color: "#ffffff" }}>{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td style={{ color: "#ffffff" }}>{fee.status}</td>
                  <td>
                    <button onClick={() => handleEdit(fee)} style={{ marginRight: "5px" }}>Edit</button>
                    {fee.status !== "paid" && (
                      <button onClick={() => handleMarkPaid(fee._id)} style={{ marginRight: "5px" }}>Mark Paid</button>
                    )}
                    <button onClick={() => handleDelete(fee._id)}>Delete</button>
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
        {filteredFees.length > 0 && (
          <div style={{ marginTop: "12px", color: "#93c5fd", fontSize: "0.9rem", textAlign: "center" }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredFees.length)} of {filteredFees.length} fees
          </div>
        )}
    </div>
  );
}

