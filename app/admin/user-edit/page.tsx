// app/admin/user-edit/[id]/page.tsx
// This is a server component that serves as the page entry point

import UserEditClient from '../components/UserEditClient';

// Correct page params type for Next.js 15
type Params = {
  id: string
};

// Server component without 'use client'
export default function UserEditPage({ params }: { params: Params }) {
  return <UserEditClient id={params.id} />;
}