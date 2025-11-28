
import React, { useState } from 'react';
import Button from '../components/Button';
import { GoogleIcon, GithubIcon } from '../components/icons/Icons';
import { login, signup, loginWithGoogle, loginWithGithub } from '../services/authService';
import type { User } from '../types';
import { isFirebaseInitialized } from '../services/firebase';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [formType, setFormType] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
        let user;
        if (formType === 'login') {
            user = await login(email, password);
        } else {
            user = await signup(name, email, password);
        }
        onLogin(user);
    } catch(err: any) {
        console.error(err);
        let msg = "An unknown error occurred.";
        
        // Handle specific Firebase Auth errors
        if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
        else if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
        else if (err.code === 'auth/operation-not-allowed') msg = "Login method not enabled. Please enable Email/Password in Firebase Console.";
        else if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
        else if (err.message) msg = err.message;
        
        setError(msg);
    } finally {
        setIsLoading(false);
    }
  };

  const handleProviderLogin = async (provider: 'google' | 'github') => {
      setError('');
      setIsLoading(true);
      try {
          let user;
          if (provider === 'google') user = await loginWithGoogle();
          else user = await loginWithGithub();
          onLogin(user);
      } catch (err: any) {
          console.error(err);
          let msg = "Provider login failed.";
          
          if (err.code === 'auth/popup-closed-by-user') msg = "Login cancelled.";
          else if (err.code === 'auth/operation-not-allowed') msg = `${provider === 'google' ? 'Google' : 'GitHub'} login is not enabled in Firebase Console.`;
          else if (err.message) msg = err.message;

          setError(msg);
      } finally {
          setIsLoading(false);
      }
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center">
      {!isFirebaseInitialized && (
        <div className="mb-6 p-3 bg-yellow-900/50 border border-yellow-700 text-yellow-200 rounded-md max-w-sm text-sm text-center">
            <strong>⚠️ Demo Mode Active</strong>
            <p>Database API keys are missing. Running with <strong>Mock Database</strong> and <strong>Mock Login</strong>.</p>
        </div>
      )}
      
      <div className="w-full max-w-sm bg-zinc-900/50 backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-zinc-700">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome to testURdsa</h2>
        <p className="text-center text-zinc-400 mb-6">Your proctored DSA testing platform.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-center text-white">{formType === 'login' ? 'Sign In' : 'Create Account'}</h3>
            
            {formType === 'signup' && (
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none text-white"
                />
            )}
            <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none text-white"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none text-white"
            />

            {error && <div className="p-2 bg-red-900/50 border border-red-700 rounded text-sm text-red-200 text-center">{error}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : (formType === 'login' ? 'Sign In' : 'Sign Up')}
            </Button>
            <p className="text-sm text-center text-zinc-400">
                {formType === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button type="button" onClick={() => { setFormType(formType === 'login' ? 'signup' : 'login'); setError('')}} className="font-medium text-amber-400 hover:text-amber-300 ml-1">
                {formType === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
            </p>
        </form>
        
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-900 text-zinc-400">Or continue with</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" onClick={() => handleProviderLogin('google')} leftIcon={<GoogleIcon className="w-5 h-5"/>} disabled={isLoading}>Google</Button>
            <Button variant="secondary" onClick={() => handleProviderLogin('github')} leftIcon={<GithubIcon className="w-5 h-5"/>} disabled={isLoading}>GitHub</Button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
