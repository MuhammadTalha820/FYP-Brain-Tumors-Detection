// src/components/Navbar.js
import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import img from "../images/logo1.png";
import "../styles/Navbar.css";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="navbar">
            <img className="logo" src={img} alt="F L" />

            <button className="toggle-button" onClick={toggleMenu}>
                <div className={isOpen ? "bar open" : "bar"}></div>
                <div className={isOpen ? "bar open" : "bar"}></div>
                <div className={isOpen ? "bar open" : "bar"}></div>
            </button>

            <ul className={isOpen ? "nav-links active" : "nav-links"}>
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) => isActive ? "active" : ""}
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/contact-us"
                        className={({ isActive }) => isActive ? "active" : ""}
                    >
                        ContactUs
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/service"
                        className={({ isActive }) => isActive ? "active" : ""}
                    >
                        Service
                    </NavLink>
                </li>
                {isAuthenticated ? (
                    <li>
                        <button onClick={handleLogout} className="nav-link-btn">Logout</button>
                    </li>
                ) : (
                    <>
                        <li>
                            <NavLink
                                to="/login"
                                className={({ isActive }) => isActive ? "active" : ""}
                            >
                                Login
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/signup"
                                className={({ isActive }) => isActive ? "active" : ""}
                            >
                                SignUp
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
