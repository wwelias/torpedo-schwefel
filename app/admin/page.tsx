import React from 'react';
import { getClubData } from '@/lib/db';
import AdminDashboard from './AdminDashboard';
import { Metadata } from 'next';

// Force dynamic rendering so that any edits to the JSON file are parsed immediately on refresh
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Torpedo Schwefel 2018 - Admin Page",
  icons: {
    icon: "/torpedo-schwefel_logo.svg",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminPage() {
  const initialData = await getClubData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminDashboard initialData={initialData} />
    </div>
  );
}
