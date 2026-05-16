import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { UserForm } from "@/components/admin/user-form";
import { createUser } from "@/features/admin/users-actions";
import { requireUserManager } from "@/features/admin/users-data";

export const dynamic = "force-dynamic";

export default async function NewAdminUserPage() {
  await requireUserManager();

  return (
    <AdminSection title="新建用户" description="为主人、伙伴或留言管理员创建后台登录账号。">
      <div className="mb-5">
        <Link className="text-sm text-blush-700" href="/admin/users">
          返回用户管理
        </Link>
      </div>
      <UserForm action={createUser} />
    </AdminSection>
  );
}
