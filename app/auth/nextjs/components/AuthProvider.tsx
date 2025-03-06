'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, UseAuthReturn } from '@/app/auth/nextjs/useUser'; // Adjust the import path as needed

// Create context with a default value
const AuthContext = createContext<UseAuthReturn | null>(null);

// Provider component
export function AuthProvider({ 
  children,
  withFullUser = false 
}: { 
  children: ReactNode,
  withFullUser?: boolean
}) {
  const auth = useAuth({ withFullUser });
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuthContext(): UseAuthReturn {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}