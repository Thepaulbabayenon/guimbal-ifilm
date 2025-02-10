import { ReactNode } from "react";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";
import { checkRole } from '@/app/action';

export default async function AdminLayout({ children }: { children: ReactNode }) {

  if (!(await checkRole('admin'))) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (Fixed Width) */}
      <Sidebar />

      {/* Main Content (Takes Remaining Space) */}
      <main className="flex-1 p-8 w-full max-w-4xl mx-auto sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

