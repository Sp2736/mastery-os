import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import ResourcesClient from './ResourcesClient';
import { getUserResources } from '@/lib/storage/readJson';

export default async function ResourcesPage() {
  const session = await verifySession();
  if (!session || !session.userId) {
    redirect('/');
    return null;
  }

  const initialData = getUserResources(session.userId);

  return (
    <div className="w-full">
      <ResourcesClient initialData={initialData} />
    </div>
  );
}
