// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AuthScreen from './components/AuthScreen';
import GalleryScreen from './components/GalleryScreen';
import Header from './components/Header';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isReady } = useAuth();
  if (!isReady) return <div className="p-6 text-center text-gray-300">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isReady } = useAuth();
  if (!isReady) return <div className="p-6 text-center text-gray-300">Loading…</div>;
  return user ? <Navigate to="/gallery" replace /> : children;
};

const AppShell: React.FC = () => (
  <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
    <Header />
    <main className="container mx-auto p-4 md:p-8">
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <AuthScreen />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <GalleryScreen />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/gallery" replace />} />
      </Routes>
    </main>
  </div>
);

const App: React.FC = () => (
  <ToastProvider>
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  </ToastProvider>
);

export default App;
