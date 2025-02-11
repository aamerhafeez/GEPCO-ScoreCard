import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../Config";

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "Admin" });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        axios.get(`${API_BASE_URL}/users`)
            .then(res => setUsers(res.data))
            .catch(err => console.error("❌ Error fetching users:", err));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        axios.post(`${API_BASE_URL}/add-user`, formData)
            .then(() => {
                alert("✅ User added successfully!");
                fetchUsers();
                setFormData({ username: "", email: "", password: "", role: "Admin" });
            })
            .catch(err => alert("Error adding user: " + err.message));
    };

    return (
        <div>
            <h2>👤 Users Management</h2>
            <form onSubmit={handleAddUser}>
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                <button type="submit">➕ Add User</button>
            </form>
        </div>
    );
};

export default UsersManagement;
