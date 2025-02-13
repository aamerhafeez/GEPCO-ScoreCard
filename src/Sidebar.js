import React from "react";
import { Link } from "react-router-dom";
import { ListGroup } from "react-bootstrap";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <div className={`bg-dark text-white ${isOpen ? "w-250px" : "w-75px"} vh-100 d-flex flex-column`}>
            <button className="btn btn-outline-light m-3" onClick={toggleSidebar}>☰</button>
            <ListGroup variant="flush">
                <ListGroup.Item as={Link} to="/" className="text-white bg-dark">🏠 Dashboard</ListGroup.Item>
                <ListGroup.Item as={Link} to="/users" className="text-white bg-dark">👤 Users</ListGroup.Item>
                <ListGroup.Item as={Link} to="/transfers" className="text-white bg-dark">🔄 Transfers</ListGroup.Item>
                <ListGroup.Item as={Link} to="/targets" className="text-white bg-dark">🎯 Targets</ListGroup.Item>
                <ListGroup.Item as={Link} to="/reports" className="text-white bg-dark">📊 Reports</ListGroup.Item>
            </ListGroup>
        </div>
    );
};

export default Sidebar;
