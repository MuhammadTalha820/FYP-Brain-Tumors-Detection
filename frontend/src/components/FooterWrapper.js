import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';  // Import your Footer component

const FooterWrapper = () => {
    const location = useLocation();  // Get the current location
    const showFooter = location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== "/Prediction";

    return showFooter ? <Footer /> : null;  // Conditionally render Footer
};

export default FooterWrapper;
