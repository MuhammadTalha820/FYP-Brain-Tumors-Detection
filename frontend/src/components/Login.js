import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            });

            if (response.data.success) {
                alert("Login successful! Starting Python client...");
                await axios.get("http://localhost:5000/api/python/start-client");
                navigate("/dashboard");
            } else {
                alert("Invalid credentials");
            }
        } catch (error) {
            console.error(error);
            alert("Error during login.");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
