import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../Config";

const EmployeesManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [offices, setOffices] = useState([]);
    const [formData, setFormData] = useState({ name: "", role: "SDO", office_id: "" });

    useEffect(() => {
        fetchEmployees();  // ✅ Fetch employees from correct API
        fetchOffices();
    }, []);

    const fetchEmployees = () => {
        axios.get(`${API_BASE_URL}/employees`)
            .then(res => {
                console.log("✅ Employees Fetched:", res.data); // Debugging
                setEmployees(res.data);
            })
            .catch(err => console.error("❌ Error fetching employees:", err));
    };

    const fetchOffices = () => {
        axios.get(`${API_BASE_URL}/offices`)
            .then(res => setOffices(res.data))
            .catch(err => console.error("❌ Error fetching offices:", err));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddEmployee = (e) => {
        e.preventDefault();
        axios.post(`${API_BASE_URL}/add-employee`, formData)
            .then(() => {
                alert("✅ Employee added successfully!");
                fetchEmployees(); // ✅ Refresh the list after adding
                setFormData({ name: "", role: "SDO", office_id: "" });
            })
            .catch(err => alert("Error adding employee: " + err.message));
    };

    const deleteEmployee = (id) => {
        if (window.confirm("⚠️ Are you sure you want to delete this employee?")) {
            axios.delete(`${API_BASE_URL}/delete-employee/${id}`)
                .then(() => fetchEmployees()) // ✅ Refresh the list after deleting
                .catch(err => console.error("❌ Error deleting employee:", err));
        }
    };

    return (
        <div>
            <h2>👨‍💼 Employees Management</h2>

            <form onSubmit={handleAddEmployee}>
                <input type="text" name="name" placeholder="Employee Name" value={formData.name} onChange={handleChange} required />

                <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="SDO">SDO</option>
                    <option value="XEN">XEN</option>
                    <option value="SE">SE</option>
                </select>

                <select name="office_id" value={formData.office_id} onChange={handleChange} required>
                    <option value="">-- Select Office --</option>
                    {offices.map(office => (
                        <option key={office.office_id} value={office.office_id}>
                            {office.office_name} ({office.office_type})
                        </option>
                    ))}
                </select>

                <button type="submit">➕ Add Employee</button>
            </form>

            <h3>📜 Employee List</h3>
            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Office</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.length > 0 ? (
                        employees.map(emp => (
                            <tr key={emp.employee_id}>
                                <td>{emp.name}</td>
                                <td>{emp.role}</td>
                                <td>{emp.office_name}</td>
                                <td>
                                    <button onClick={() => deleteEmployee(emp.employee_id)}>❌ Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center" }}>No employees found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeesManagement;
