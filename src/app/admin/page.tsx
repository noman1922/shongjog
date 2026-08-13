import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminDashboardData, getCurrentAdminUser } from "@/lib/admin/data";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const admin = await getCurrentAdminUser();

  if (!admin) {
    redirect("/admin/login?error=forbidden");
  }

  const data = await getAdminDashboardData();

  return <AdminDashboard adminName={admin.fullName} data={data} />;
}

