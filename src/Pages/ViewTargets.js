import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../Config";

const ViewTargets = () => {
    const [targets, setTargets] = useState([]);
    const [filterRole, setFilterRole] = useState("All");
    const [filterOffice, setFilterOffice] = useState("All");
    const [userId, setUserId] = useState(localStorage.getItem("user_id") || "");

    useEffect(() => {
        axios.get(`${API_BASE_URL}/targets`)
            .then(res => setTargets(res.data))
            .catch(err => console.error("Error fetching targets:", err));
    }, []);

    const handleRequestUpdate = (targetId) => {
        const achievedValue = prompt("Enter Achieved Value:");
        if (achievedValue) {
            axios.post("{API_BASE_URL}/request-achievement-update", {
                user_id: userId,
                target_id: targetId,
                achieved_value: achievedValue,
                month: new Date().getFullYear()
            })
            .then(() => {
                alert("Update request submitted for admin approval!");
                window.location.reload();
            })
            .catch(err => alert("Error: " + err.response?.data?.error));
        }
    };

    const filteredTargets = targets.filter(t =>
        (filterRole === "All" || t.role === filterRole) &&
        (filterOffice === "All" || t.office_name === filterOffice)
    );

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
            <h2>🎯 View Assigned Targets</h2>

            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <select onChange={e => setFilterRole(e.target.value)}>
                    <option value="All">All Roles</option>
                    {Array.from(new Set(targets.map(t => t.name))).map((office, index) => (
                            <option key={office || index} value={office}>{office}</option>
                    ))}
                </select>

                <select onChange={e => setFilterOffice(e.target.value)}>
                    <option value="All">All Offices</option>
                    {Array.from(new Set(targets.map(t => t.office_name))).map((office, index) => (
                            <option key={office || index} value={office}>{office}</option>
                    ))}
                </select>
            </div>

            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>Officer</th>
                        <th>Role</th>
                        <th>Office</th>
                        <th>Target</th>
                        <th>Assigned</th>
                        <th>Achieved</th>
                        <th>Approval Status</th>
                        <th>Request Update</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTargets.length > 0 ? (
                        filteredTargets.map(target => (
                            <tr key={target.target_id}>
                                <td>{target.officer_name}</td>
                                <td>{target.role}</td>
                                <td>{target.office_name}</td>
                                <td>{target.target_name}</td>
                                <td>{target.target_value}</td>
                                <td>{target.achieved_value}</td>
                                <td>{target.approval_status}</td>
                                <td>
                                    {target.user_id == userId && target.approval_status !== 'Approved' ? (
                                        <button onClick={() => handleRequestUpdate(target.target_id)}>✏️ Request Update</button>
                                    ) : (
                                        "🔒"
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: "center" }}>No Targets Found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ViewTargets;
