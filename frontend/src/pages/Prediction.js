// src/components/Prediction.js

import React, { useState } from "react";
import axios from "axios";
import "../styles/Prediction.css";
import gif from "../images/Fading balls.gif"; // Ensure this path is correct

const Prediction = () => {
    const [loading, setLoading] = useState(false);

    const handleStartPrediction = async (e) => {
        e.preventDefault();
        setLoading(true); // Show the loader

        try {
            // Use the correct endpoint URL.
            const response = await axios.get("http://localhost:5000/api/predict/start-client");
            console.log("Prediction started:", response.data);
            alert(response.data.message);
        } catch (error) {
            console.error("Error starting prediction:", error);
            alert("Error starting prediction.");
        } finally {
            setLoading(false); // Hide the loader after receiving a response
        }
    };

    return (
        <div className="prediction-container">
            <h1>Predict Brain Tumor</h1>
            {loading ? (
                <div className="loading-indicator">
                    {/* Using the imported GIF for the loading animation */}
                    <img src={gif} alt="Loading..." />
                </div>
            ) : (
                <button className="start-button" onClick={handleStartPrediction}>
                    Start Prediction
                </button>
            )}
        </div>
    );
};

export default Prediction;
