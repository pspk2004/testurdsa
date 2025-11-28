import React from 'react';
import { CodeIcon, UserCircleIcon, LogoutIcon } from './icons/Icons';
import type { User } from '../types';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CodeIcon className="w-8 h-8 text-amber-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">testURdsa</h1>
        </div>
        {user && (
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <UserCircleIcon className="w-8 h-8 text-zinc-400" />
                    <span className="hidden sm:inline text-zinc-300">{user.name}</span>
                </div>
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-red-600/50 rounded-md text-zinc-300 hover:text-white transition-colors duration-200"
                    aria-label="Logout"
                >
                    <LogoutIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;