// components/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: string;
}

export const LoadingSpinner = ({ size }: LoadingSpinnerProps) => {
  const spinnerClass = size === 'sm' 
    ? 'h-40 w-full' 
    : 'h-screen w-full';
    
  return (
    <div className={`flex ${spinnerClass} items-center justify-center bg-gray-900 text-white`}>
      <h1 className="text-2xl font-bold">Loading...</h1>
    </div>
  );
};