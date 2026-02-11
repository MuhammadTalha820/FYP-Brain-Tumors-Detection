import React, { useState } from "react";
import '../styles/ContactUs.css'

const ContactUs = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        licenseNumber: "",
        specialty: "",
        phoneNumber: "",
        hospitalName: "",
        description: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="contact-container" >
            <h1>Contact Us</h1>
            <form
                className="contact-form"
                action="https://formspree.io/f/xjkblzep" // Replace with your Formspree form URL
                method="POST"
            >
                <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="licenseNumber"
                    placeholder="License Number"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="specialty"
                    placeholder="Specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                />
                <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="hospitalName"
                    placeholder="Hospital Name"
                    value={formData.hospitalName}
                    onChange={handleChange}
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                />

                <button type="submit" >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default ContactUs;
