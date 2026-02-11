// src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        // If the user is not authenticated, redirect to the login page
        return <Navigate to="/login" replace />;
    }

    // Otherwise, allow access to the protected route
    return children;
};

export default ProtectedRoute;
