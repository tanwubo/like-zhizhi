import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { disableUser, enableUser } from "@/features/admin/users-actions";
import { getAdminUsers, requireUserManager } from "@/features/admin/users-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

function roleLabel(role: string) {
  if (role === "OWNER") return "主人";
  if (role === "PARTNER") return "伙伴";
  return "留言管理员";
}

export default async function AdminUsersPage() {
  await requireUserManager();
  const users = await getAdminUsers();

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">用户管理</h1>
          <p className="mt-1 text-sm text-ink/60">创建后台账号、分配角色，并停用不再需要的访问权限。</p>
        </div>
        <Link className="rounded-md bg-blush-600 px-4 py-2 text-sm font-medium text-white" href="/admin/users/new">
          新建用户
        </Link>
      </div>

      <AdminSection title="后台用户">
        {users.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="text-ink/50">
                <tr className="border-b border-blush-100">
                  <th className="py-2 pr-4 font-medium">用户</th>
                  <th className="py-2 pr-4 font-medium">角色</th>
                  <th className="py-2 pr-4 font-medium">状态</th>
                  <th className="py-2 pr-4 font-medium">创建时间</th>
                  <th className="py-2 pr-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-blush-50 align-top">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-ink">{user.name}</p>
                      <p className="mt-1 break-all text-xs leading-5 text-ink/55">{user.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-ink/60">{roleLabel(user.role)}</td>
                    <td className="py-3 pr-4 text-ink/60">{user.disabledAt ? "已停用" : "启用"}</td>
                    <td className="py-3 pr-4 text-ink/60">{formatDateLabel(user.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-3">
                        <Link className="text-blush-700" href={`/admin/users/${user.id}/edit`}>
                          编辑
                        </Link>
                        {user.disabledAt ? (
                          <form action={enableUser}>
                            <input type="hidden" name="id" value={user.id} />
                            <button className="text-blush-700" type="submit">
                              启用
                            </button>
                          </form>
                        ) : (
                          <form action={disableUser}>
                            <input type="hidden" name="id" value={user.id} />
                            <button className="text-ink/45 hover:text-blush-700" type="submit">
                              停用
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-ink/60">暂无后台用户。</p>
        )}
      </AdminSection>
    </div>
  );
}
