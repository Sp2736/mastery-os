'use server';

import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  getUserProgress, getUserAchievements, getAchievementDefinitions, getUserProfile,
} from '@/lib/storage/readJson';
import JourneyClient from './JourneyClient';

export default async function JourneyPage() {
  const session = await verifySession();
  if (!session) redirect('/');

  const { userId } = session;
  const progress = getUserProgress(userId);
  const profile = getUserProfile(userId);
  const userAchievements = getUserAchievements(userId);
  const definitions = getAchievementDefinitions();

  const unlockedIds = new Set(userAchievements.unlocked.map(a => a.id));

  const achievementsWithStatus = definitions.achievements.map(def => ({
    ...def,
    unlocked: unlockedIds.has(def.id),
    unlockedAt: userAchievements.unlocked.find(a => a.id === def.id)?.unlockedAt ?? null,
  }));

  return (
    <JourneyClient
      xp={progress.xp}
      streak={progress.streak}
      achievements={achievementsWithStatus}
      displayName={profile.displayName}
    />
  );
}
