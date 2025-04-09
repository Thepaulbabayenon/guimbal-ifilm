import { ComponentProps } from 'react';

declare module '@/app/components/LoadingSpinner' {
  export interface LoadingSpinnerProps {
    size?: string;
  }
  
  export const LoadingSpinner: React.FC<LoadingSpinnerProps>;
}