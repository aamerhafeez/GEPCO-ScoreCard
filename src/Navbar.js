import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";

const TopNavbar = ({ toggleSidebar }) => {
    return (
        <Navbar bg="light" expand="lg" className="shadow-sm px-3">
            <button className="btn btn-outline-dark" onClick={toggleSidebar}>☰</button>
            <Navbar.Brand className="ms-3">KPI System</Navbar.Brand>
            <Nav className="ms-auto">
                <Nav.Link href="#">🔔 Notifications</Nav.Link>
                <Nav.Link href="#">👤 Profile</Nav.Link>
            </Nav>
        </Navbar>
    );
};

export default TopNavbar;
