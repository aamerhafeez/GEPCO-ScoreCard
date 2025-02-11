import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import UserManagement from "./Pages/UserManagement";
import TransferManagement from "./Pages/TransferManagement";
import ManageTargets from "./Pages/ManageTargets";  // ✅ Renamed from AddTarget
import TargetHeads from "./Pages/TargetHeads";  // ✅ New Page for managing Target Heads
import Reports from "./Pages/Reports";
import Targets from "./Pages/Targets";  // ✅ Parent component for Targets
import Login from "./Pages/Login";
import AdminApprovals from "./Pages/AdminApprovals";
import { useState } from "react";

function App() {
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [role, setRole] = useState(localStorage.getItem("role") || "");

    return (
        <Router>
            <nav>
                <Link to="/">🏠 Home</Link>
                {token ? (
                    <>
                        <Link to="/users">👤 Manage Users</Link>
                        <Link to="/transfers">🔄 Transfers</Link>
                        <Link to="/targets">🎯 Targets</Link>

                        <Link to="/reports">📊 Reports</Link>
                        {role === "Admin" && <Link to="/admin-approvals">🛠 Admin Approvals</Link>}
                        <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("role"); setToken(""); }}>🚪 Logout</button>
                    </>
                ) : (
                    <Link to="/login">🔑 Login</Link>
                )}
            </nav>

            <Routes>
                <Route path="/" element={<h1>Welcome to KPI System</h1>} />
                <Route path="/users" element={token ? <UserManagement /> : <Navigate to="/login" />} />
                <Route path="/transfers" element={token ? <TransferManagement /> : <Navigate to="/login" />} />

                {/* ✅ Targets Parent Route */}
                <Route path="/targets/*" element={token ? <Targets /> : <Navigate to="/login" />} />

                {/* ✅ Nested Routes for Targets */}
                <Route path="/targets/manage" element={token ? <ManageTargets /> : <Navigate to="/login" />} />
                <Route path="/targets/heads" element={token ? <TargetHeads /> : <Navigate to="/login" />} />

                <Route path="/admin-approvals" element={role === "Admin" ? <AdminApprovals /> : <Navigate to="/" />} />
                <Route path="/reports/*" element={<Reports />} />
                <Route path="/login" element={<Login setToken={setToken} setRole={setRole} />} />
            </Routes>
        </Router>
    );
}

export default App;
