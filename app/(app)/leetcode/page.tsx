import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserLeetCode } from '@/lib/storage/readJson';
import LeetcodeClient from './LeetcodeClient';

export default async function LeetcodePage() {
  const session = await verifySession();
  if (!session) redirect('/');
  
  const leetcode = getUserLeetCode(session.userId);

  return <LeetcodeClient initialData={leetcode} />;
}
