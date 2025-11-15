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
        setRole(selectedRole);
        setIsDropdownOpen(false);
        setError("");
    }

    function handleId(e) { setId(e.target.value); setError(""); }
    function handlePassword(e) { setPassword(e.target.value); setError(""); }

    async function handleLogin() {
        if (!id.trim() || !password.trim() || !role) {
            setError("Warning: Please fill all fields correctly.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await authAPI.login(id, password, role);
            const { token, user } = response.data;
            
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("role", user.role);
            if (user.studentId) {
                sessionStorage.setItem("studentId", user.studentId);
            }
            if (user.studentInfo) {
                sessionStorage.setItem("studentInfo", JSON.stringify(user.studentInfo));
            }

            if (user.role === "student") {
                navigate("/student");
            } else if (user.role === "admin") {
                navigate("/admin");
            }
        } catch (err) {
            setError(err.response?.data?.message || `Warning: Incorrect ${role} ID or Password`);
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

                <div className="main-bottom">
                    <p>{role ? `${role} Login` : "Select Role"}</p>

                    {/* Custom Dropdown */}
                    <div className="custom-select">
                        <div
                            className="select-selected"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            {role || "---"}
                            <span className="select-arrow">▼</span>
                        </div>
                        {isDropdownOpen && (
                            <div className="select-options">
                                <div
                                    className="select-option"
                                    onClick={() => handleRoleSelect("Student")}
                                >
                                    Student
                                </div>
                                <div
                                    className="select-option"
                                    onClick={() => handleRoleSelect("Admin")}
                                >
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
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={handlePassword}
                    />

                    {error && <p className="error-message">{error}</p>}

                    <button onClick={handleLogin}>Login</button>
                </div>
            </div>
        </div>
    );
}