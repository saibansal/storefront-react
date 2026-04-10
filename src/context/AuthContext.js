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

            // Extract User ID directly from the JWT token payload (more reliable)
            let userId = null;
            try {
                const base64Url = data.token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                userId = payload.data?.user?.id || payload.id;
            } catch (e) {
                console.error('JWT Decode Error:', e);
            }

            const userProfile = {
                id: userId,
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

    const signup = async (email, password, name) => {
        try {
            const basicAuth = btoa(`${API_CONFIG.CONSUMER_KEY}:${API_CONFIG.CONSUMER_SECRET}`);
            const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${basicAuth}`
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    username: email.split('@')[0] + Math.floor(Math.random() * 1000),
                    first_name: name.split(' ')[0],
                    last_name: name.split(' ').slice(1).join(' ') || '',
                    role: 'subscriber'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                let message = errorData.message || 'Signup failed';
                message = message.replace(/<[^>]*>?/gm, '');
                throw new Error(message);
            }

            // After successful signup, log the user in to get the JWT token
            return await login(email, password);
        } catch (error) {
            console.error('Signup Error:', error);
            return { success: false, message: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('aura_jwt_token');
        localStorage.removeItem('aura_user_info');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
