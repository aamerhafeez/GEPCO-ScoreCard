import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../Config";

const OfficerReport = () => {
    const [userId, setUserId] = useState(""); // Stores selected user
    const [reportData, setReportData] = useState([]); // Stores fetched report
    const [error, setError] = useState(""); // Error handling

    const fetchReport = () => {
        if (!userId) {
            setError("Please enter a valid User ID.");
            return;
        }

        axios.get(`${API_BASE_URL}/officer-report/${userId}`)
            .then(response => {
                setReportData(response.data);
                setError("");
            })
            .catch(error => {
                setError("Failed to fetch report.");
                console.error("Error fetching report:", error);
            });
    };

    return (
        <div>
            <h2>👮 Officer Monthly Report</h2>
            <input
                type="number"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <button onClick={fetchReport}>Get Report</button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {reportData.length > 0 ? (
                <table border="1">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Assigned Target</th>
                            <th>Achieved Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.formatted_month}</td>
                                <td>{row.target_value}</td>
                                <td>{row.achieved_value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No report data available.</p>
            )}
        </div>
    );
};

export default OfficerReport;
