import { redirect } from 'next/navigation';


import { db } from '@/app/db/drizzle';
import { film } from '@/app/db/schema';

export const dynamic = "force-dynamic"; // Ensure dynamic rendering
export default async function AdminDashboard(params: {
  searchParams: { search?: string; filmId?: string }
}) {
  

  const { search, filmId } = params.searchParams;
  const films = await db.select().from(film);

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
      </div>
    </div>
  );
}
