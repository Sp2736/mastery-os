import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ArchitectureClient from './ArchitectureClient';

export const metadata = {
  title: 'Architecture & System Design | Mastery OS',
  description: 'Deep-dive into the zero-database Git-as-a-datastore architecture of Mastery OS.',
};

export default async function ArchitecturePage() {
  const session = await verifySession();
  if (!session || !session.userId) {
    redirect('/');
    return null;
  }

  return <ArchitectureClient userId={session.userId} />;
}

