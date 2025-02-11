import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../Config";

const AdminApprovalHistory = () => {
    const [history, setHistory] = useState([]);
    const isAdmin = localStorage.getItem("role") === "Admin";

    useEffect(() => {
        axios.get("${API_BASE_URL}/approval-history")
            .then(res => setHistory(res.data))
            .catch(err => console.error("Error fetching approval history:", err));
    }, []);

    if (!isAdmin) {
        return <h2>Access Denied. Only Admins can view this page.</h2>;
    }

    return (
        <div>
            <h2>Approval History</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Officer</th>
                        <th>Target</th>
                        <th>Achieved Value</th>
                        <th>Status</th>
                        <th>Approved By</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(item => (
                        <tr key={item.achievement_id}>
                            <td>{item.officer_name}</td>
                            <td>{item.target_name}</td>
                            <td>{item.achieved_value}</td>
                            <td>{item.approval_status}</td>
                            <td>{item.approved_by || "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminApprovalHistory;
