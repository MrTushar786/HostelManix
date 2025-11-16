import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";
import { authAPI } from "../utils/api.js";

export default function Login() {
  const [role, setRole] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleRoleSelect(selectedRole) {
    setRole(selectedRole); // display-friendly (Student / Admin)
    setIsDropdownOpen(false);
    setError("");
  }

  function handleId(e) {
    setId(e.target.value);
    setError("");
  }
  function handlePassword(e) {
    setPassword(e.target.value);
    setError("");
  }

  async function handleLogin(e) {
    // If called from form submit, prevent default browser reload
    if (e && e.preventDefault) e.preventDefault();

    // Simple validation before starting loader
    if (!id.trim() || !password.trim() || !role) {
      setError("Warning: Please fill all fields correctly.");
      return;
    }

    // prevent double submission
    if (loading) return;

    // start loading + close dropdown
    setIsDropdownOpen(false);
    setLoading(true);
    setError("");

    try {
      // normalize role for backend (e.g., "Student" -> "student")
      const roleToSend = role.toLowerCase();

      const response = await authAPI.login(id, password, roleToSend);
      const { token, user } = response.data;

      // persist session info
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", user.role);
      if (user.studentId) {
        sessionStorage.setItem("studentId", user.studentId);
      }
      if (user.studentInfo) {
        sessionStorage.setItem("studentInfo", JSON.stringify(user.studentInfo));
      }

      // navigate by returned role (trust backend)
      if (user.role === "student") navigate("/student");
      else if (user.role === "admin") navigate("/admin");
      else navigate("/"); // fallback
    } catch (err) {
      // friendly error handling
      const msg = err?.response?.data?.message || `Warning: Incorrect ${role} ID or Password`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main">
      <h1>HostelManix</h1>
      <div className="main-item">
        <div className="main-top">
          <h1>Login</h1>
        </div>

        {/* form handles Enter key automatically */}
        <form className="main-bottom" onSubmit={handleLogin}>
          <p>{role ? `${role} Login` : "Select Role"}</p>

          {/* Custom Dropdown */}
          <div className="custom-select">
            <div
              className="select-selected"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setIsDropdownOpen(!isDropdownOpen)}
            >
              {role || "---"}
              <span className="select-arrow">▼</span>
            </div>

            {isDropdownOpen && (
              <div className="select-options">
                <div className="select-option" onClick={() => handleRoleSelect("Student")}>
                  Student
                </div>
                <div className="select-option" onClick={() => handleRoleSelect("Admin")}>
                  Admin
                </div>
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="User ID"
            value={id}
            onChange={handleId}
            autoComplete="username"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePassword}
            autoComplete="current-password"
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="login-button"
            aria-busy={loading}
            aria-label="Login"
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Loading...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
