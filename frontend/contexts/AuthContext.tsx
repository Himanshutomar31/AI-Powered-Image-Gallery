
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import * as mockApi from '../services/mockApiService';
import { useToast } from './ToastContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        const loggedInUser = mockApi.getCurrentUser();
        if (loggedInUser) {
            setUser(loggedInUser);
        }
    }, []);

    const login = (email: string) => {
        try {
            const loggedInUser = mockApi.login(email, 'password'); // Password ignored in mock
            setUser(loggedInUser);
            addToast('Login successful!', 'success');
        } catch (error) {
            if (error instanceof Error) {
                addToast(error.message, 'error');
            }
        }
    };

    const register = (email: string) => {
        try {
            const newUser = mockApi.register(email, 'password'); // Password ignored in mock
            setUser(newUser);
            addToast('Registration successful!', 'success');
        } catch (error) {
            if (error instanceof Error) {
                addToast(error.message, 'error');
            }
        }
    };

    const logout = () => {
        mockApi.logout();
        setUser(null);
        addToast('Logged out successfully.', 'success');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
