import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../Config"; // ✅ Using centralized API URL

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "SDO" });
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/users`)
            .then(res => setUsers(res.data))
            .catch(err => console.error("Error fetching users:", err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        axios.post(`${API_BASE_URL}/users`, formData)
            .then(res => {
                alert("User added successfully!");
                setUsers([...users, { ...formData, user_id: res.data.userId }]);
                setFormData({ name: "", email: "", password: "", role: "SDO" });
            })
            .catch(err => alert("Error adding user: " + err.message));
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role });
    };

    const handleUpdateUser = (e) => {
        e.preventDefault();
        axios.put(`${API_BASE_URL}/users/${editingUser.user_id}`, formData)
            .then(() => {
                alert("User updated successfully!");
                setUsers(users.map(u => (u.user_id === editingUser.user_id ? { ...u, ...formData } : u)));
                setEditingUser(null);
                setFormData({ name: "", email: "", password: "", role: "SDO" });
            })
            .catch(err => alert("Error updating user: " + err.message));
    };

    const handleDeleteUser = (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        axios.delete(`${API_BASE_URL}/users/${id}`)
            .then(() => {
                alert("User deleted successfully!");
                setUsers(users.filter(user => user.user_id !== id));
            })
            .catch(err => alert("Error deleting user: " + err.message));
    };

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
            <h2>👤 Manage Users</h2>

            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser}>
                <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                {!editingUser && <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />}
                <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="SDO">SDO</option>
                    <option value="Deputy Manager">Deputy Manager</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                </select>
                <button type="submit">{editingUser ? "Update User" : "Add User"}</button>
            </form>

            <h3>📜 User List</h3>
            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.user_id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button onClick={() => handleEditUser(user)}>✏️ Edit</button>
                                <button onClick={() => handleDeleteUser(user.user_id)}>❌ Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;
