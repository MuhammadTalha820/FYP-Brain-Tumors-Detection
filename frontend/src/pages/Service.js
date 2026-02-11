import React from "react";
import { motion } from "framer-motion";
import "../styles/Service.css";
import image1 from "../images/images3.jpg";
import image5 from "../images/images5.png";
import image7 from "../images/images7.jpg";
import image8 from "../images/image8.jpg";
import image6 from "../images/images6.jpeg";
import image9 from "../images/Vr.png"; // New backup image for the additional service

const services = [
    {
        title: "AI-Powered Diagnostics",
        description: "Our advanced AI models provide accurate medical diagnostics, enhancing early detection and treatment outcomes.",
        image: "https://source.unsplash.com/600x400/?ai,healthcare",
        backupImage: image1,
    },
    {
        title: "Federated Learning Security",
        description: "Protect patient data with our decentralized federated learning models, ensuring privacy without compromising accuracy.",
        image: "https://source.unsplash.com/600x400/?cybersecurity,privacy",
        backupImage: image5,
    },
    {
        title: "Real-Time Data Processing",
        description: "Leverage real-time AI insights for faster and more effective decision-making in healthcare and research.",
        image: "https://source.unsplash.com/600x400/?data,analytics",
        backupImage: image6,
    },
    {
        title: "Cloud-Based AI Solutions",
        description: "Deploy scalable AI models in the cloud, providing seamless access to cutting-edge technology for medical professionals.",
        image: "https://source.unsplash.com/600x400/?cloud,technology",
        backupImage: image7,
    },
    {
        title: "Predictive Healthcare Insights",
        description: "Use AI-driven predictive analytics to anticipate and prevent diseases before they become critical.",
        image: "https://source.unsplash.com/600x400/?healthcare,analytics",
        backupImage: image8,
    },
    {
        title: "Virtual Health Assistants",
        description: "Our virtual health assistants provide round-the-clock support, appointment scheduling, and personalized care to make healthcare more accessible.",
        image: "https://source.unsplash.com/600x400/?virtual,assistant,healthcare",
        backupImage: image9,
    },
];

const Services = () => {
    return (
        <div className="services-page">
            <motion.h1
                className="services-title"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                Our Cutting-Edge Services
            </motion.h1>

            <div className="services-list">
                {services.map((service, index) => (
                    <motion.div
                        key={index}
                        className="service-card"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <img
                            src={service.image}
                            alt={service.title}
                            className="service-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = service.backupImage;
                            }}
                        />

                        <h2 className="service-title">{service.title}</h2>
                        <p className="service-description">{service.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Services;
