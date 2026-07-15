import React from 'react';
import { getClubData } from '@/lib/db';
import AdminDashboard from './AdminDashboard';

// Force dynamic rendering so that any edits to the JSON file are parsed immediately on refresh
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const initialData = await getClubData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminDashboard initialData={initialData} />
    </div>
  );
}
