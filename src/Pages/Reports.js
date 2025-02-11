import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line, Pie } from "react-chartjs-2";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, 
    PointElement, Title, Tooltip, Legend, ArcElement
} from "chart.js";
import { Link, Route, Routes } from "react-router-dom"; // ✅ Added routing
import API_BASE_URL from "../Config";
import OfficerReport from "./OfficerReport"; // ✅ Import Officer Report

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, 
    PointElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/report-data`)
            .then(res => setReportData(res.data))
            .catch(err => console.error("Error fetching report data:", err));
    }, []);

    // Extract unique months & roles
    const months = [...new Set(reportData.map(item => item.month))];
    const roles = [...new Set(reportData.map(item => item.role))];

    // Prepare Bar Chart Data (Assigned vs Achieved)
    const barChartData = {
        labels: months,
        datasets: [
            {
                label: "Assigned Target",
                data: months.map(month => reportData
                    .filter(d => d.month === month)
                    .reduce((sum, d) => sum + d.target_value, 0)),
                backgroundColor: "rgba(54, 162, 235, 0.6)",
            },
            {
                label: "Achieved Target",
                data: months.map(month => reportData
                    .filter(d => d.month === month)
                    .reduce((sum, d) => sum + d.achieved_value, 0)),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
            }
        ]
    };

    // Prepare Line Chart Data for Trend Analysis
    const lineChartData = {
        labels: months,
        datasets: roles.map(role => ({
            label: `${role} Achievements`,
            data: months.map(month => reportData
                .filter(d => d.month === month && d.role === role)
                .reduce((sum, d) => sum + d.achieved_value, 0)),
            borderColor: role === "SDO" ? "blue" : role === "XEN" ? "green" : "red",
            fill: false
        }))
    };

    // Prepare Pie Chart Data for Role-Wise Achievement
    const roleWiseData = roles.map(role => ({
        role,
        totalAchieved: reportData
            .filter(d => d.role === role)
            .reduce((sum, d) => sum + d.achieved_value, 0)
    }));

    const pieChartData = {
        labels: roleWiseData.map(d => d.role),
        datasets: [
            {
                data: roleWiseData.map(d => d.totalAchieved),
                backgroundColor: ["blue", "green", "red"]
            }
        ]
    };

    // Export Data to Excel
    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(reportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "KPI_Report");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "KPI_Report.xlsx");
    };

    return (
        <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
            <h2>📊 KPI Performance Reports</h2>

            {/* ✅ Navigation for Reports */}
            <nav>
                <Link to="/reports">📄 All Reports</Link> | 
                <Link to="/reports/officer">👮 Officer Report</Link>
            </nav>

            <Routes>
                {/* ✅ Main Reports Section */}
                <Route path="/" element={
                    <>
                        <button onClick={exportToExcel} style={{ marginBottom: "10px" }}>📥 Export to Excel</button>

                        <h3>📌 Assigned vs. Achieved Targets</h3>
                        <Bar data={barChartData} />

                        <h3>📌 Achievement Trends Over Time</h3>
                        <Line data={lineChartData} />

                        <h3>📌 Role-Wise Achievements</h3>
                        <Pie data={pieChartData} />
                    </>
                } />

                {/* ✅ Officer Report Section */}
                <Route path="officer" element={<OfficerReport />} />
            </Routes>
        </div>
    );
};

export default Reports;
