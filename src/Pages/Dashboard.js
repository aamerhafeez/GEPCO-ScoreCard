import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../Config";

const Dashboard = () => {
    const [kpiData, setKpiData] = useState([]);
    const [formData, setFormData] = useState({ role: "", division: "", circle: "", target: "", achieved: "" });

    // Fetch KPI Data
    useEffect(() => {
        axios.get("${API_BASE_URL}/kpi-data")
            .then(response => setKpiData(response.data))
            .catch(error => console.error("Error fetching KPI data:", error));
    }, []);

    // Handle Form Input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Submit New KPI Entry
    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post("${API_BASE_URL}/kpi-data", formData)
            .then(response => {
                setKpiData([...kpiData, response.data]);
                setFormData({ role: "", division: "", circle: "", target: "", achieved: "" });
            })
            .catch(error => console.error("Error adding KPI:", error));
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>📊 KPI Dashboard</h2>
            
            {/* KPI Input Form */}
            <form onSubmit={handleSubmit} style={styles.form}>
                <input type="text" name="role" placeholder="Role (SDO, XEN, SE)" value={formData.role} onChange={handleChange} required />
                <input type="text" name="division" placeholder="Division" value={formData.division} onChange={handleChange} required />
                <input type="text" name="circle" placeholder="Circle" value={formData.circle} onChange={handleChange} required />
                <input type="number" name="target" placeholder="Target" value={formData.target} onChange={handleChange} required />
                <input type="number" name="achieved" placeholder="Achieved" value={formData.achieved} onChange={handleChange} required />
                <button type="submit" style={styles.submitButton}>Add KPI</button>
            </form>

            {/* KPI Data Table */}
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Role</th>
                        <th>Division</th>
                        <th>Circle</th>
                        <th>Target</th>
                        <th>Achieved</th>
                        <th>Progress</th>
                    </tr>
                </thead>
                <tbody>
                    {kpiData.length > 0 ? (
                        kpiData.map((row, index) => (
                            <tr key={row.id}>
                                <td>{index + 1}</td>
                                <td>{row.role}</td>
                                <td>{row.division}</td>
                                <td>{row.circle}</td>
                                <td>{row.target}</td>
                                <td>{row.achieved}</td>
                                <td>
                                    <div style={styles.progressContainer}>
                                        <div style={{
                                            ...styles.progressBar,
                                            width: `${(row.achieved / row.target) * 100}%`,
                                            backgroundColor: (row.achieved / row.target) * 100 >= 80 ? "green" : "red"
                                        }}>
                                            {((row.achieved / row.target) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={styles.noData}>No KPI data available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// Styling
const styles = {
    container: {
        padding: "20px",
        fontFamily: "'Arial', sans-serif",
        maxWidth: "80%",
        margin: "auto"
    },
    title: {
        fontSize: "28px",
        color: "#333",
        textAlign: "center"
    },
    form: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px",
        gap: "10px"
    },
    submitButton: {
        padding: "10px 15px",
        backgroundColor: "#28a745",
        color: "#fff",
        border: "none",
        cursor: "pointer"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: "#fff",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)"
    },
    progressContainer: {
        width: "100%",
        height: "20px",
        backgroundColor: "#ddd",
        borderRadius: "10px",
        overflow: "hidden"
    },
    progressBar: {
        height: "100%",
        textAlign: "center",
        lineHeight: "20px",
        fontSize: "12px",
        color: "#fff"
    },
    noData: {
        textAlign: "center",
        padding: "10px",
        color: "gray"
    }
};

export default Dashboard;
