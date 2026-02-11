import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2
import "../styles/Signup.css";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/auth/signup", {
                email,
                password,
            });

            if (response.data.success) {
                // Show a success popup
                Swal.fire({
                    icon: "success",
                    title: "Signup Successful",
                    text: "Redirecting to login page...",
                    timer: 2000,
                    showConfirmButton: false,
                }).then(() => {
                    navigate("/login"); // Redirect to the login page after the popup closes
                });
            } else {
                // Show an error popup if signup was unsuccessful
                Swal.fire({
                    icon: "error",
                    title: "Signup Error",
                    text: "Error during signup.",
                });
            }
        } catch (error) {
            console.error(error);
            // Show an error popup if there was an exception
            Swal.fire({
                icon: "error",
                title: "Signup Error",
                text: "Error during signup.",
            });
        }
    };

    return (
        <div className="signup-wrapper"> {/* Background wrapper */}
            <div className="signup-container"> {/* Centered form */}
                <h2>Signup</h2>
                <form onSubmit={handleSignup} className="signup-form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                    <button type="submit">Signup</button>
                </form>
                <p>
                    Already have an account?{" "}
                    <Link to="/login">Log in here</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;
