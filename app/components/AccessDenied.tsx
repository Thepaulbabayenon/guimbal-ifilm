// components/AccessDenied.tsx
export const AccessDenied = () => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
      <div className="text-center p-8 border border-red-600 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-xl mb-6">You must be logged in to view this page.</p>
        <a
          href="/sign-in"
          className="inline-block px-6 py-3 text-lg font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
        >
          Login Now
        </a>
      </div>
    </div>
  );
  