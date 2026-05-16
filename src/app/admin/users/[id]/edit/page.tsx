import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { UserForm } from "@/components/admin/user-form";
import { updateUser } from "@/features/admin/users-actions";
import { getAdminUser, requireUserManager } from "@/features/admin/users-data";

export const dynamic = "force-dynamic";

export default async function EditAdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUserManager();
  const { id } = await params;
  const user = await getAdminUser(id);

  return (
    <AdminSection title="编辑用户" description="更新用户资料、角色或替换登录密码。">
      <div className="mb-5">
        <Link className="text-sm text-blush-700" href="/admin/users">
          返回用户管理
        </Link>
      </div>
      <UserForm action={updateUser} user={user} />
    </AdminSection>
  );
}
