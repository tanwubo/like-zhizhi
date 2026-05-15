import Link from "next/link";
import type { ReactNode } from "react";
import type { CurrentUser } from "@/server/auth/session";

const navGroups = [
  {
    label: "总览",
    items: [["管理概览", "/admin"]]
  },
  {
    label: "内容管理",
    items: [
      ["点滴", "/admin/content/notes"],
      ["留言审核", "/admin/content/messages"],
      ["足迹", "/admin/content/footprints"],
      ["相册", "/admin/content/album"],
      ["清单", "/admin/content/checklist"],
      ["纪念日", "/admin/content/love-days"],
      ["音乐", "/admin/content/music"]
    ]
  },
  {
    label: "站点设置",
    items: [
      ["基础设置", "/admin/settings/site"],
      ["人物资料", "/admin/settings/people"],
      ["主题设置", "/admin/settings/theme"],
      ["模块开关", "/admin/settings/modules"]
    ]
  },
  {
    label: "系统",
    items: [
      ["集成配置", "/admin/integrations"],
      ["用户管理", "/admin/users"]
    ]
  }
] as const;

export function AdminShell({ user, children }: { user: CurrentUser; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-blush-100 bg-blush-50/70 p-5 md:block">
        <Link href="/admin" className="text-lg font-semibold text-ink">
          Like Zhizhi
        </Link>
        <nav className="mt-8 grid gap-5 text-sm text-ink/70">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-xs font-medium uppercase tracking-wide text-ink/40">{group.label}</p>
              <div className="mt-2 grid gap-1">
                {group.items.map(([label, href]) => (
                  <Link key={href} href={href} className="rounded-md px-3 py-2 hover:bg-white">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <div className="md:pl-56">
        <header className="flex items-center justify-between border-b border-blush-100 px-5 py-4">
          <p className="text-sm text-ink/60">当前用户：{user.name}</p>
          <form action="/api/auth/logout" method="post">
            <button className="text-sm text-blush-700" type="submit">
              退出
            </button>
          </form>
        </header>
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}
