import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../Config";

const AddTarget = () => {
    const [circles, setCircles] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [subdivisions, setSubdivisions] = useState([]);
    const [employees, setEmployees] = useState([]);
    
    const [selectedCircle, setSelectedCircle] = useState("");
    const [selectedDivision, setSelectedDivision] = useState("");
    const [selectedSubdivision, setSelectedSubdivision] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState("");

    useEffect(() => {
        axios.get(`${API_BASE_URL}/offices-hierarchy`)
            .then(response => {
                const uniqueCircles = [...new Map(response.data.map(item => [item.circle_id, item])).values()];
                setCircles(uniqueCircles);
            })
            .catch(error => console.error("Error fetching offices:", error));
    }, []);

    const handleCircleChange = (e) => {
        const circleId = e.target.value;
        setSelectedCircle(circleId);
        setSelectedDivision("");
        setSelectedSubdivision("");
        setSelectedEmployee("");

        setDivisions(circles.filter(o => o.circle_id === parseInt(circleId)));
    };

    const handleDivisionChange = (e) => {
        const divisionId = e.target.value;
        setSelectedDivision(divisionId);
        setSelectedSubdivision("");
        setSelectedEmployee("");

        setSubdivisions(divisions.filter(o => o.division_id === parseInt(divisionId)));
    };

    const handleSubdivisionChange = (e) => {
        const subdivisionId = e.target.value;
        setSelectedSubdivision(subdivisionId);
        setSelectedEmployee("");

        axios.get(`${API_BASE_URL}/employees-by-office?subdivision_id=${subdivisionId}`)
            .then(response => setEmployees(response.data))
            .catch(error => console.error("Error fetching employees:", error));
    };

    return (
        <div>
            <h2>Assign Target</h2>
            <form>
                <label>🏢 Select Circle:</label>
                <select value={selectedCircle} onChange={handleCircleChange}>
                    <option value="">Select Circle</option>
                    {circles.map(circle => (
                        <option key={circle.circle_id} value={circle.circle_id}>{circle.circle_name}</option>
                    ))}
                </select>

                <label>🏢 Select Division:</label>
                <select value={selectedDivision} onChange={handleDivisionChange} disabled={!selectedCircle}>
                    <option value="">Select Division</option>
                    {divisions.map(division => (
                        <option key={division.division_id} value={division.division_id}>{division.division_name}</option>
                    ))}
                </select>

                <label>🏢 Select Sub-Division:</label>
                <select value={selectedSubdivision} onChange={handleSubdivisionChange} disabled={!selectedDivision}>
                    <option value="">Select Sub-Division</option>
                    {subdivisions.map(subdivision => (
                        <option key={subdivision.subdivision_id} value={subdivision.subdivision_id}>{subdivision.subdivision_name}</option>
                    ))}
                </select>

                <label>👤 Select Employee:</label>
                <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} disabled={!selectedSubdivision && !selectedDivision && !selectedCircle}>
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                        <option key={emp.employee_id} value={emp.employee_id}>{emp.name} ({emp.role})</option>
                    ))}
                </select>

                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default AddTarget;
