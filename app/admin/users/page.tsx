import UserManagementServer from "@/app/admin/components/UserManagementServer";

export const dynamic = "force-dynamic";
export default function AdminUsersPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">User Management</h1>
      <UserManagementServer />
    </div>
  );
}
