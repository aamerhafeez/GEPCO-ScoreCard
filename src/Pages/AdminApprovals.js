import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../Config";

const AdminApprovals = () => {
    const [requests, setRequests] = useState([]);
    const isAdmin = localStorage.getItem("role") === "Admin";

    useEffect(() => {
        axios.get(`${API_BASE_URL}/pending-achievements`)
            .then(res => setRequests(res.data))
            .catch(err => console.error("Error fetching pending approvals:", err));
    }, []);

    const handleApproval = (achievementId, status) => {
        axios.post(`${API_BASE_URL}/approve-achievement`, { achievementId, status })
            .then(() => {
                alert("Achievement " + status);
                window.location.reload();
            })
            .catch(err => alert("Error: " + err.response?.data?.error));
    };

    if (!isAdmin) {
        return <h2>Access Denied. Only Admins can view this page.</h2>;
    }

    return (
        <div>
            <h2>Pending Achievement Approvals</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Officer</th>
                        <th>Target</th>
                        <th>Achieved Value</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.length > 0 ? (
                        requests.map(req => (
                            <tr key={req.achievement_id}>
                                <td>{req.officer_name}</td>
                                <td>{req.target_name}</td>
                                <td>{req.achieved_value}</td>
                                <td>
                                    <button onClick={() => handleApproval(req.achievement_id, "Approved")}>✅ Approve</button>
                                    <button onClick={() => handleApproval(req.achievement_id, "Rejected")}>❌ Reject</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center" }}>No Pending Approvals</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminApprovals;
