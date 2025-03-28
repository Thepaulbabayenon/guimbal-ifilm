// app/admin/components/AdminCheck.tsx
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/app/auth/nextjs/useUser'; 
import { useRouter } from 'next/navigation';

export default function AdminCheck() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);
  
  // Return null as this is just a guard component
  return null;
}