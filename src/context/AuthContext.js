import React, { createContext, useContext, useState, useEffect } from 'react';
import API_CONFIG from '../apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('aura_user_info');
        const token = localStorage.getItem('aura_jwt_token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}jwt-auth/v1/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                let message = errorData.message || 'Invalid credentials';
                // Strip HTML tags if present (WordPress often returns them)
                message = message.replace(/<[^>]*>?/gm, '');
                throw new Error(message);
            }

            const data = await response.json();
            // Data structure from JWT plugin: { token, user_email, user_nicename, user_display_name }
            const userProfile = {
                id: data.user_id, // Might need to check if your plugin returns id or if you want to use nicename
                email: data.user_email,
                name: data.user_display_name,
                nicename: data.user_nicename
            };

            setUser(userProfile);
            localStorage.setItem('aura_jwt_token', data.token);
            localStorage.setItem('aura_user_info', JSON.stringify(userProfile));
            return { success: true };
        } catch (error) {
            console.error('Login Error:', error);
            return { success: false, message: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('aura_jwt_token');
        localStorage.removeItem('aura_user_info');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
