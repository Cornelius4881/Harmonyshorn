import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

type AuthMode = 'signin' | 'signup' | 'reset';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, signUp, resetPassword, setGuest } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signUp(email, password);
        onClose();
      } else if (mode === 'reset') {
        await resetPassword(email);
        alert('Check your email for password reset instructions');
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleGuestMode = () => {
    setGuest(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#2E8B57]">
            {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#2E8B57]"
              required
            />
          </div>
          
          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#2E8B57]"
                required
              />
            </div>
          )}
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            className="w-full bg-[#2E8B57] text-white py-2 rounded-md hover:bg-opacity-90 transition-colors"
          >
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          {mode === 'signin' ? (
            <>
              <button
                onClick={() => setMode('signup')}
                className="text-[#2E8B57] hover:underline"
              >
                Need an account? Sign up
              </button>
              <span className="block mt-2">
                <button
                  onClick={() => setMode('reset')}
                  className="text-[#2E8B57] hover:underline"
                >
                  Forgot password?
                </button>
              </span>
            </>
          ) : (
            <button
              onClick={() => setMode('signin')}
              className="text-[#2E8B57] hover:underline"
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={handleGuestMode}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}