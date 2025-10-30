
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-gray-800 shadow-md">
            <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    AI-Powered Image Gallery
                </h1>
                {user && (
                    <div className="flex items-center space-x-4">
                        <span className="hidden sm:block text-gray-300">{user.email}</span>
                        <button
                            onClick={logout}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
