import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../Config";

const TargetHeads = () => {
    const [targetHeads, setTargetHeads] = useState([]);
    const [newHead, setNewHead] = useState("");

    useEffect(() => {
        fetchTargetHeads();
    }, []);

    const fetchTargetHeads = () => {
        axios.get(`${API_BASE_URL}/target-heads`)
            .then(response => setTargetHeads(response.data))
            .catch(error => console.error("Error fetching target heads:", error));
    };

    const addTargetHead = () => {
        if (!newHead) return alert("Enter a target head name!");

        axios.post(`${API_BASE_URL}/add-targethead`, { head: newHead })
            .then(() => {
                alert("Target head added!");
                setNewHead("");
                fetchTargetHeads();
            })
            .catch(error => console.error("Error adding target head:", error));
    };

    // Function to Delete a Target Head
    const deleteTargetHead = (id) => {
        if (!window.confirm("Are you sure you want to delete this target head?")) return;

        axios.post(`${API_BASE_URL}/delete-targethead`, { id })
            .then(() => {
                alert("Target head deleted!");
                fetchTargetHeads();
            })
            .catch(error => console.error("Error deleting target head:", error));
    };

    return (
        <div>
            <h2>📂 Target Heads Management</h2>

            {/* Add New Target Head */}
            <input
                type="text"
                placeholder="Enter Target Head"
                value={newHead}
                onChange={(e) => setNewHead(e.target.value)}
            />
            <button onClick={addTargetHead}>➕ Add Target Head</button>

            {/* Target Heads Table */}
            <table border="1" width="100%" style={{ marginTop: "20px" }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Target Head</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {targetHeads.map(head => (
                        <tr key={head.id}>
                            <td>{head.id}</td>
                            <td>{head.head}</td>
                            <td>
                                <button onClick={() => deleteTargetHead(head.id)}>❌ Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TargetHeads;
