
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AuthScreen from './components/AuthScreen';
import GalleryScreen from './components/GalleryScreen';
import Header from './components/Header';

const AppContent: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                {user ? <GalleryScreen /> : <AuthScreen />}
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ToastProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ToastProvider>
    );
};

export default App;
