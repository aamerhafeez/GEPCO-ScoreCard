import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../Config";
import "./ManageTargets.css"; // Ensure CSS is properly applied
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const ManageTargets = () => {
    const [targets, setTargets] = useState([]);
    const [offices, setOffices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [targetHeads, setTargetHeads] = useState([]);

    const [selectedCircle, setSelectedCircle] = useState("");
    const [selectedDivision, setSelectedDivision] = useState("");
    const [selectedSubdivision, setSelectedSubdivision] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedTargetHead, setSelectedTargetHead] = useState("");
    const [targetValue, setTargetValue] = useState("");
    const [month, setMonth] = useState("");
    const [allTargets, setAllTargets] = useState([]);
    const [officerName, setOfficerName] = useState("XYZ SE");
    const [officeName, setOfficeName] = useState("Circle 1");

    useEffect(() => {
        fetchTargets();
        fetchOfficesHierarchy();
        fetchTargetHeads();
    }, []);

    const fetchTargets = () => {
        axios.get(`${API_BASE_URL}/targets`)
            .then(response => {
                //console.log("✅ Targets Fetched:", response.data);
                setAllTargets(response.data);
                setTargets(response.data);
                setOfficerName(response.data[0].officer_name); // Assuming API returns user_name
                setOfficeName(response.data[0].office_name); // Assuming API returns office_name

            })
            .catch(error => console.error("❌ Error fetching targets:", error));
    };

    const fetchOfficesHierarchy = () => {
        axios.get(`${API_BASE_URL}/offices-hierarchy`)
            .then(response => {
                console.log("✅ Offices Hierarchy Fetched:", response.data);
                setOffices(response.data);
            })
            .catch(error => console.error("❌ Error fetching office hierarchy:", error));
    };

    const fetchTargetHeads = () => {
        axios.get(`${API_BASE_URL}/target-heads`)
            .then(response => {
                console.log("✅ Target Heads Fetched:", response.data);
                setTargetHeads(response.data);
            })
            .catch(error => console.error("❌ Error fetching target heads:", error));
    };
    const handleAchievementSubmit = (targetId) => {
        const achievedValue = prompt("Enter Achieved Value:");
        if (achievedValue !== null) {
            axios.post(`${API_BASE_URL}/add-achievement`, {
                target_id: targetId,
                achieved_value: achievedValue
            })
            .then(() => {
                alert("✅ Achievement recorded successfully!");
                fetchTargets();
            })
            .catch(error => alert("❌ Error submitting achievement: " + error.message));
        }
    };
    const handleDelete = (targetId) => {
        if (window.confirm("Are you sure you want to delete this target?")) {
            axios.delete(`${API_BASE_URL}/delete-target/${targetId}`)
                .then(() => {
                    alert("✅ Target deleted successfully!");
                    fetchTargets();
                })
                .catch(error => alert("❌ Error deleting target: " + error.message));
        }
    };
    const handleOfficeSelection = (officeId) => {
        if (!officeId) {
            setEmployees([]);
            return;
        }

        axios.get(`${API_BASE_URL}/employees-by-office?office_id=${officeId}`)
            .then(response => {
                console.log("👤 Employees for Selected Office:", response.data);
                setEmployees(response.data);
            })
            .catch(error => console.error("❌ Error fetching employees:", error));
    };

    const handleCircleChange = (e) => {
        const circleId = parseInt(e.target.value);
        setSelectedCircle(circleId);
        setSelectedDivision("");
        setSelectedSubdivision("");
        setSelectedEmployee("");

        //setEmployees([]); // Clear employees since selection changed

        handleOfficeSelection(circleId);
    };

    const handleDivisionChange = (e) => {
        const divisionId = parseInt(e.target.value);
        setSelectedDivision(divisionId);
        setSelectedSubdivision("");
        setSelectedEmployee("");
        handleOfficeSelection(divisionId);
    };

    const handleSubdivisionChange = (e) => {
        const subdivisionId = parseInt(e.target.value);
        setSelectedSubdivision(subdivisionId);
        setSelectedEmployee("");
        handleOfficeSelection(subdivisionId);
    };

    const handleEmployeeChange = (e) => {
        const employeeId = e.target.value;
        setSelectedEmployee(employeeId);

        if (!employeeId) {
            setTargets(allTargets);
            return;
        }

        const filteredTargets = allTargets.filter(target => String(target.employee_id) === String(employeeId));
        console.log("Filtered Targets:", filteredTargets);
        setTargets(filteredTargets);
    };

    const clearForm = () => {
        setSelectedCircle("");
        setSelectedDivision("");
        setSelectedSubdivision("");
        setSelectedEmployee("");
        setSelectedTargetHead("");
        setTargetValue("");
        setMonth("");
    };

    const addTarget = () => {
        if (!selectedEmployee || !selectedCircle || !targetValue || !month || !selectedTargetHead) {
            alert("⚠️ All fields are required!");
            return;
        }

        const payload = {
            employee_id: selectedEmployee,
            office_id: selectedCircle,
            target_name: "Assigned Target",
            target_value: parseInt(targetValue),
            month: `${month}-01`, // Ensure full YYYY-MM-DD format
            assigned_by: 1,
            target_head_id: selectedTargetHead
        };

        axios.post(`${API_BASE_URL}/add-target`, payload)
            .then(() => {
                alert("✅ Target added successfully!");
                fetchTargets();
                clearForm();
            })
            .catch(error => {
                console.error("🔥 Error adding target:", error);
                alert(`❌ Failed to add target: ${error.response?.data?.error || error.message}`);
            });
    };

const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Officer Name: " + officerName, 14, 20);

    let startY = 30;
    let currentOffice = "";
    const tableColumn = ["S.No", "Target Head", "Month", "Target", "Achieved"];
    let tableRows = [];

    targets.forEach((target, index) => {
        // When office changes, add a new subheading and print the previous office's table
        if (target.office_name !== currentOffice) {
            if (tableRows.length > 0) {
                doc.autoTable({
                    startY: startY,
                    head: [tableColumn],
                    body: tableRows,
                    theme: 'striped'
                });
                startY = doc.lastAutoTable.finalY + 10;
                tableRows = []; // Reset table for the new office
            }

            // Add new office heading only once per office
            doc.setFontSize(14);
            doc.text("Office: " + target.office_name, 14, startY);
            startY += 8;
            currentOffice = target.office_name;
        }

        // Add rows to the table
        tableRows.push([
            tableRows.length + 1, // Reset numbering for each office
            target.target_head_name,
            target.formatted_month,
            target.target_value,
            target.achieved_value || "0"
        ]);
    });

    // Print the last office's table
    if (tableRows.length > 0) {
        doc.autoTable({
            startY: startY,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped'
        });
    }

    doc.save("Targets_Report.pdf");
};

    return (
        <div className="container">
            <h2 className="title">📊 Manage Targets</h2>

            <div className="form-section">
                <div className="dropdown-group">
                    <div>
                        <label>🏢 Select Circle:</label>
                        <select value={selectedCircle} onChange={handleCircleChange}>
                            <option value="">Select Circle</option>
                            {offices
                                .filter(office => office.office_type === "Circle")
                                .map(circle => (
                                    <option key={circle.office_id}
                                            value={circle.office_id}>{circle.office_name}</option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label>🏢 Select Division:</label>
                        <select value={selectedDivision} onChange={handleDivisionChange} disabled={!selectedCircle}>
                            <option value="">Select Division</option>
                            {offices
                                .filter(office => office.parent_office_id === selectedCircle && office.office_type === "Division")
                                .map(division => (
                                    <option key={division.office_id}
                                            value={division.office_id}>{division.office_name}</option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label>🏢 Select Sub-Division:</label>
                        <select value={selectedSubdivision} onChange={handleSubdivisionChange}
                                disabled={!selectedDivision}>
                            <option value="">Select Sub-Division</option>
                            {offices
                                .filter(office => office.parent_office_id === selectedDivision && office.office_type === "Sub-Division")
                                .map(subdivision => (
                                    <option key={subdivision.office_id}
                                            value={subdivision.office_id}>{subdivision.office_name}</option>
                                ))}
                        </select>
                    </div>
                </div>

                <div className="dropdown-group">
                    <div>
                        <label>🎯 Select Target Head:</label>
                        <select value={selectedTargetHead} onChange={(e) => setSelectedTargetHead(e.target.value)}>
                            <option value="">Select Target Head</option>
                            {targetHeads.map(th => (
                                <option key={th.id} value={th.id}>{th.head}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>👤 Select Employee:</label>
                        <select value={selectedEmployee} onChange={handleEmployeeChange}>
                            <option value="">Select Employee</option>
                            {employees.map(emp => (
                                <option key={emp.employee_id} value={emp.employee_id}>
                                    {emp.name} ({emp.role})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label>📅 Month:</label>
                    <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} required/>

                    <label>🎯 Target Value:</label>
                    <input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} required/>
                </div>
                <div className="button-container">
                    <button className="report-btn" onClick={generatePDF}>📄 Report</button>
                    <button className="submit-btn" onClick={addTarget}>✅ Submit</button>
                </div>
            </div>

            {targets.length > 0 && (
                <table className="target-table">
                    <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Target Head</th>
                        <th>Month</th>
                        <th>Target</th>
                        <th>Achieved</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                        {targets.map((target, index) => (
                            <tr key={index} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                                <td>{index + 1}</td>
                                <td>{target.target_head_name || "N/A"}</td>
                                <td>{target.formatted_month || "N/A"}</td>
                                <td>{target.target_value || "0"}</td>
                                <td>{target.achieved_value || "0"}</td>
                                <td>
                                    <button className="action-btn"
                                            onClick={() => handleAchievementSubmit(target.target_id)}>📊 Enter Value
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDelete(target.target_id)}
                                            style={{marginLeft: "10px", color: "red"}}>❌
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManageTargets;
