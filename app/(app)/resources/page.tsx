import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
// Resources component
import ResourcesClient from './ResourcesClient';
import { getUserResources } from '@/lib/storage/readJson';

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'fallback-secret-for-dev-only-please-change-it');

export default async function ResourcesPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('mastery_session')?.value;
  if (!session) redirect('/');

  let userId = '';
  try {
    const { payload } = await jwtVerify(session, SECRET);
    userId = payload.userId as string;
  } catch {
    redirect('/');
  }

  const initialData = getUserResources(userId);

  return (
    <div className="w-full">
      <ResourcesClient initialData={initialData} />
    </div>
  );
}
