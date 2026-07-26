'use client';

import { Lock } from 'lucide-react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => {
        if (typeof window !== 'undefined' && (window as any).getAccess?.logout) {
          (window as any).getAccess.logout();
        } else {
          // Fallback redirect
          window.location.href = '/';
        }
      }}
      className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/50 hover:text-white"
      title="Lock OS"
    >
      <Lock className="w-4 h-4" />
    </button>
  );
}
