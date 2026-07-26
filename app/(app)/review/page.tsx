'use server';

import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserJournal } from '@/lib/storage/readJson';
import { computeCorrelations } from '@/lib/insights/correlations';
import ReviewClient from './ReviewClient';

export default async function ReviewPage() {
  const session = await verifySession();
  if (!session) redirect('/');

  const journal = getUserJournal(session.userId);
  const insights = computeCorrelations(journal.entries);
  const recent = journal.entries.slice(-7).reverse();

  return <ReviewClient recent={recent} insights={insights} />;
}
