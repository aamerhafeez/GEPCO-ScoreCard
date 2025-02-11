import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../Config";

const TransferManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [offices, setOffices] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [filteredTransfers, setFilteredTransfers] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: "",
        from_office_id: "",
        to_office_id: "",
        reason: "",
    });
    const [filteredOffices, setFilteredOffices] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        axios.get(`${API_BASE_URL}/employees`)
            .then(res => setEmployees(res.data))
            .catch(err => console.error("Error fetching employees:", err));

        axios.get(`${API_BASE_URL}/offices`)
            .then(res => setOffices(res.data))
            .catch(err => console.error("Error fetching offices:", err));

        axios.get(`${API_BASE_URL}/transfers`)
            .then(res => {
                setTransfers(res.data);
                setFilteredTransfers(res.data);
            })
            .catch(err => console.error("Error fetching transfers:", err));
    };

    const roleToOfficeTypeMap = {
        SE: "Circle",
        XEN: "Division",
        SDO: "Sub-Division"
    };

    const handleEmployeeChange = (e) => {
        const empId = e.target.value;
        const selectedEmployee = employees.find(emp => String(emp.employee_id) === String(empId));
        if (!selectedEmployee) return;

        setFormData(prev => ({
            ...prev,
            employee_id: empId,
            from_office_id: selectedEmployee.office_id || "",
            to_office_id: ""
        }));

        // Filter offices based on employee role mapped to office_type
        const officeType = roleToOfficeTypeMap[selectedEmployee.role];
        if (officeType) {
            const filtered = offices.filter(office => office.office_type === officeType);
            setFilteredOffices(filtered);
        } else {
            setFilteredOffices(offices);
        }

        // Filter transfers based on selected employee
        const filteredTransfers = transfers.filter(transfer => parseInt(transfer.employee_id) ===parseInt (empId));
        setFilteredTransfers(filteredTransfers);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${API_BASE_URL}/transfers`, formData)
            .then(() => {
                alert("Transfer recorded successfully!");
                setFormData({ employee_id: "", from_office_id: "", to_office_id: "", reason: "" });
                fetchData(); // Refresh data without reloading page
            })
            .catch(err => alert("Error submitting transfer: " + err.message));
    };

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
            <h2>Manage Employee Transfers</h2>
            <form onSubmit={handleSubmit}>
                <label>Select Employee:</label>
                <select name="employee_id" value={formData.employee_id} onChange={handleEmployeeChange} required>
                    <option value="">-- Select Employee --</option>
                    {employees.map(emp => (
                        <option key={emp.employee_id} value={emp.employee_id}>{emp.name}</option>
                    ))}
                </select>

                <label>From Office:</label>
                <input type="text" value={offices.find(o => o.office_id === formData.from_office_id)?.office_name || ""} readOnly />

                <label>To Office:</label>
                <select name="to_office_id" value={formData.to_office_id} onChange={handleChange} required>
                    <option value="">-- Select Office --</option>
                    {filteredOffices.map(office => (
                        <option key={office.office_id} value={office.office_id}>{office.office_name}</option>
                    ))}
                </select>

                <label>Reason:</label>
                <textarea name="reason" value={formData.reason} onChange={handleChange} required />
                <button type="submit">Submit Transfer</button>
            </form>

            <h3>Transfer Records</h3>
            <table>
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>From Office</th>
                        <th>To Office</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransfers.map((transfer) => (
                        <tr key={transfer.transfer_id}>
                            <td>{transfer.employee}</td>
                            <td>{transfer.from_office}</td>
                            <td>{transfer.to_office}</td>
                            <td>{transfer.reason}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransferManagement;