import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { canAccessAdmin } from "@/server/auth/roles";
import { getCurrentUser } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user || !canAccessAdmin(user.role)) {
    redirect("/login");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
