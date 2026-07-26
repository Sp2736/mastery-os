import { getUserProfile, getUserSettings, validateUserId } from '@/lib/storage/readJson';
import { notFound } from 'next/navigation';
import { Shield } from 'lucide-react';
import Image from 'next/image';

export default async function PublicProfile({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  
  try {
    validateUserId(userId);
  } catch {
    notFound();
  }

  const settings = getUserSettings(userId);
  if (!settings.publicProfile) {
    return (
      <div className="min-h-screen bg-[#08090c] text-white flex flex-col items-center justify-center">
        <Shield className="w-16 h-16 text-white/20 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Profile Private</h1>
        <p className="text-white/40">This user's profile is not public.</p>
      </div>
    );
  }

  const profile = getUserProfile(userId);

  return (
    <div className="min-h-screen bg-[#08090c] text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-[#08090c] to-[#08090c] opacity-50" />
      
      <main className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl font-bold shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-6">
            {profile.displayName.charAt(0)}
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{profile.displayName}</h1>
          <p className="text-white/50 font-mono">@{userId} · Mastery OS</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-colors">
            <h2 className="text-lg font-semibold text-white/60 uppercase tracking-wider text-sm">Completion</h2>
            <img src={`/api/public/${userId}/badge/completion`} alt="Completion Badge" className="w-full max-w-[200px]" />
          </div>
          
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-colors">
            <h2 className="text-lg font-semibold text-white/60 uppercase tracking-wider text-sm">Current Streak</h2>
            <img src={`/api/public/${userId}/badge/streak`} alt="Streak Badge" className="w-full max-w-[200px]" />
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-colors md:col-span-2">
            <h2 className="text-lg font-semibold text-white/60 uppercase tracking-wider text-sm">Flex Showcase</h2>
            <img src={`/api/flex/${userId}/showcase`} alt="Showcase" className="w-full rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
