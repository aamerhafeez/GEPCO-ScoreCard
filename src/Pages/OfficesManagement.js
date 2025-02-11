import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../Config";

const OfficesManagement = () => {
    const [offices, setOffices] = useState([]);
    const [officeTypes, setOfficeTypes] = useState([]);
    const [newOffice, setNewOffice] = useState({ office_name: "", office_type: "", parent_office_id: "" });

    useEffect(() => {
        fetchOffices();
        fetchOfficeTypes();
    }, []);

    // ✅ Fetch All Offices
    const fetchOffices = () => {
        axios.get(`${API_BASE_URL}/offices`)
            .then(res => {
                setOffices(res.data);
            })
            .catch(err => console.error("❌ Error fetching offices:", err));
    };

    // ✅ Fetch Office Types Dynamically
    const fetchOfficeTypes = () => {
        axios.get(`${API_BASE_URL}/office-types`)
            .then(res => {
                setOfficeTypes(res.data);
            })
            .catch(err => console.error("❌ Error fetching office types:", err));
    };

    // ✅ Handle Input Change
    const handleChange = (e) => {
        setNewOffice({ ...newOffice, [e.target.name]: e.target.value });

        // 🛠 Reset Parent Office When Office Type Changes
        if (e.target.name === "office_type") {
            setNewOffice({ ...newOffice, office_type: e.target.value, parent_office_id: "" });
        }
    };

    // ✅ Handle Office Addition
    const addOffice = () => {
        if (!newOffice.office_name || !newOffice.office_type) {
            alert("⚠️ Please enter office name and select type!");
            return;
        }

        axios.post(`${API_BASE_URL}/add-office`, newOffice)
            .then(() => {
                alert("✅ Office added successfully!");
                setNewOffice({ office_name: "", office_type: "", parent_office_id: "" });
                fetchOffices();
            })
            .catch(err => console.error("❌ Error adding office:", err));
    };

    // ✅ Handle Office Deletion
    const deleteOffice = (officeId) => {
        if (window.confirm("⚠️ Are you sure you want to delete this office?")) {
            axios.delete(`${API_BASE_URL}/delete-office/${officeId}`)
                .then(() => fetchOffices())
                .catch(err => console.error("❌ Error deleting office:", err));
        }
    };

    return (
        <div>
            <h2>🏢 Offices Management</h2>

            {/* 🔹 Add New Office Form */}
            <div style={{ marginBottom: "20px" }}>
                <input 
                    type="text" 
                    name="office_name" 
                    placeholder="Office Name" 
                    value={newOffice.office_name} 
                    onChange={handleChange} 
                />

                {/* ✅ Dynamically Populated Office Type Dropdown */}
                <select name="office_type" value={newOffice.office_type} onChange={handleChange}>
                    <option value="">Select Type</option>
                    {officeTypes.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                    ))}
                </select>

                {/* 🔹 Parent Office Dropdown */}
                <select 
                    name="parent_office_id"
                    value={newOffice.parent_office_id}
                    onChange={handleChange}
                    disabled={!newOffice.office_type} // Disabled if no office type selected
                >
                    <option value="">-- Select Parent Office --</option>
                    {offices.length > 0 ? (
                        offices
                            .filter(office => {
                                return (
                                    office.office_type &&
                                    (
                                        (newOffice.office_type === "Division" && office.office_type === "Circle") ||
                                        (newOffice.office_type === "Sub-Division" && office.office_type === "Division")
                                    )
                                );
                            })
                            .map(office => (
                                <option key={office.office_id} value={office.office_id}>
                                    {office.office_name} ({office.office_type})
                                </option>
                            ))
                    ) : (
                        <option disabled>Loading...</option>
                    )}
                </select>

                <button onClick={addOffice}>➕ Add Office</button>
            </div>

            {/* 🔹 Offices Table */}
            <h3>📜 Office List</h3>
            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Parent Office</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {offices.length > 0 ? (
                        offices.map(office => (
                            <tr key={office.office_id}>
                                <td>{office.office_name}</td>
                                <td>{office.office_type}</td>
                                <td>{offices.find(o => o.office_id === office.parent_office_id)?.office_name || "None"}</td>
                                <td>
                                    <button onClick={() => deleteOffice(office.office_id)}>❌ Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center" }}>No offices found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OfficesManagement;
