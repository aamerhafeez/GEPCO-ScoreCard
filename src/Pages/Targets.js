import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import ManageTargets from "./ManageTargets";
import TargetHeads from "./TargetHeads";
import OfficesManagement from "./OfficesManagement";
import EmployeesManagement from "./EmployeesManagement";

const Targets = () => {
    return (
        <div>
            <h2>🎯 Targets Management</h2>

            {/* ✅ Navigation for managing targets, offices, and employees */}
            <nav>
                <Link to="/targets/manage">📋 Manage Targets</Link> | 
                <Link to="/targets/heads">📂 Target Heads</Link> |
                <Link to="/targets/offices">🏢 Manage Offices</Link> |
                <Link to="/targets/employees">👨‍💼 Manage Employees</Link>
            </nav>

            <Routes>
                <Route path="manage" element={<ManageTargets />} />
                <Route path="heads" element={<TargetHeads />} />
                <Route path="offices" element={<OfficesManagement />} />
                <Route path="employees" element={<EmployeesManagement />} />
                <Route path="/" element={<h3>Select an option above.</h3>} />
            </Routes>
        </div>
    );
};

export default Targets;
