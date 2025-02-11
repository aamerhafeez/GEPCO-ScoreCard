import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import API_BASE_URL from "../Config"; // 🔹 Use LAN IP instead of localhost

const Login = ({ setToken, setRole }) => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Handle Input Changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Login Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/login`, formData);
            
            console.log("🛠 DEBUG: Received response:", res.data); // ✅ Debugging

            if (!res.data.user_id) {
                console.error("❌ ERROR: Missing user_id in response");
                setError("Login failed: user_id missing");
                return;
            }

            // ✅ Store credentials in localStorage
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);
            localStorage.setItem("user_id", res.data.user_id);

            console.log("✅ user_id stored in localStorage:", localStorage.getItem("user_id")); // ✅ Verify storage

            // ✅ Update state
            setToken(res.data.token);
            setRole(res.data.role);

            navigate("/dashboard"); // Redirect to dashboard
        } catch (err) {
            console.error("🔥 Login failed:", err.response?.data || err);
            setError(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h2>🔑 Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <br />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
