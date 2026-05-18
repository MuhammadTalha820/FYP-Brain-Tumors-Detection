import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import "../styles/Login.css";  // Import your CSS
import { AuthContext } from "../context/AuthContext"; // Import AuthContext

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            });

            if (response.data.success) {
                // Display a success popup
                Swal.fire({
                    icon: "success",
                    title: "Login Successful",
                    text: "You have logged in successfully!",
                    timer: 2000,
                    showConfirmButton: false,
                });

                login(); // Update the authentication state

                // Navigate after a short delay to allow the popup to be seen
                setTimeout(() => {
                    navigate("/Prediction");
                }, 2000);
            } else {
                // Display an error popup for invalid credentials
                Swal.fire({
                    icon: "error",
                    title: "Invalid Credentials",
                    text: "Please check your email and password and try again.",
                });
            }
        } catch (error) {
            console.error(error);
            // Display an error popup for login errors
            Swal.fire({
                icon: "error",
                title: "Login Error",
                text: "An error occurred during login. Please try again later.",
            });
        }
    };

    return (
        <div className="login-wrapper "> {/* Full-Screen Background */}
            <div className="login-container "> {/* Centered Form */}
                <h2>Login</h2>
                <form onSubmit={handleLogin} className="login-form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
