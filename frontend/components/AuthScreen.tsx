// src/components/AuthScreen.tsx
import React, { useState, FormEvent } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();
  const { login, register } = useAuth(); 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      addToast('Username and password are required.', 'error');
      return;
    }
    if (!isLogin) {
      if (!email) {
        addToast('Email is required for registration.', 'error');
        return;
      }
      if (password !== confirmPassword) {
        addToast('Passwords do not match.', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(username, password); 
        addToast('Logged in successfully!', 'success');
        navigate('/gallery', { replace: true });
      } else {
        await register(username, email, password, confirmPassword);
        addToast('Registration successful. Please log in.', 'success');
        setIsLogin(true);
      }
    } catch (err: any) {
      addToast(err?.message || 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center pt-10">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white">
          {isLogin ? 'Login' : 'Register'}
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="text-sm font-medium text-gray-300 block mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="yourusername"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-300 block mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="you@example.com"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-300 block mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300 block mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 transition duration-300"
          >
            {loading ? (isLogin ? 'Logging in…' : 'Creating…') : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-purple-400 hover:underline ml-1"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
