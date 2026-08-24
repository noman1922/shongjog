import { AdminDashboard } from "@/components/admin/admin-dashboard";
import {
  getAdminDashboardData,
  getAdminPostsList,
  getAdminStoriesList,
  getAdminUsersList,
} from "@/lib/admin/data";
import { requireAdminUser } from "@/lib/admin/permissions";

export default async function AdminPage() {
  // 1. Enforce Server-Side Admin Role Verification
  const admin = await requireAdminUser();

  // 2. Fetch Live Dashboard Data, User Directory, Posts, and Stories in Parallel
  const [data, users, posts, stories] = await Promise.all([
    getAdminDashboardData(),
    getAdminUsersList(),
    getAdminPostsList(),
    getAdminStoriesList(),
  ]);

  return (
    <AdminDashboard
      admin={admin}
      data={data}
      posts={posts}
      stories={stories}
      users={users}
    />
  );
}
