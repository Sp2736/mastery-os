'use client';

import { useState } from 'react';
import { LogOut, Lock } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'icon' | 'full';
  className?: string;
}

export default function LogoutButton({ variant = 'icon', className = '' }: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Hard redirect to / to reset state and show Access Gate
      window.location.href = '/';
    }
  };

  if (variant === 'full') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-400/80 hover:text-red-300 text-xs font-mono transition-all duration-200 cursor-pointer group ${
          isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        title="Lock OS & Return to Access Gate"
      >
        <span className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-red-400/70 group-hover:scale-110 transition-transform" />
          <span>{isLoggingOut ? 'Locking...' : 'Lock Session'}</span>
        </span>
        <LogOut className="w-3.5 h-3.5 text-red-400/40 group-hover:text-red-400/80 transition-colors" />
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`p-2 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-white/50 hover:text-red-400 transition-all duration-200 cursor-pointer group ${
        isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      title="Lock OS & Return to Access Gate"
    >
      <Lock className="w-4 h-4 group-hover:hidden transition-transform" />
      <LogOut className="w-4 h-4 hidden group-hover:block transition-transform text-red-400" />
    </button>
  );
}
