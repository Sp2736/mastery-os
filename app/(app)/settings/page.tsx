'use server';

import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserSettings, getUserProfile } from '@/lib/storage/readJson';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const session = await verifySession();
  if (!session) redirect('/');

  const settings = getUserSettings(session.userId);
  const profile = getUserProfile(session.userId);

  return <SettingsClient settings={settings} profile={profile} userId={session.userId} />;
}
