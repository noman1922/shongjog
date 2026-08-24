import { redirect } from "next/navigation";

import { AdminLoginPage } from "@/components/admin/admin-login-page";
import { getCurrentAdminUser } from "@/lib/admin/data";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLoginRoute({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const admin = await getCurrentAdminUser();

    if (admin) {
      redirect("/admin");
    }

    redirect("/dashboard");
  }

  const params = await searchParams;
  const error =
    params.error === "forbidden"
      ? "This account is not authorized as a Shongjog admin."
      : params.error;

  return <AdminLoginPage error={error} />;
}

