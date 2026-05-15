import Link from "next/link";
import type { ReactNode } from "react";
import type { CurrentUser } from "@/server/auth/session";

const navItems = [
  ["概览", "/admin"],
  ["点滴", "/admin/content/notes"],
  ["留言", "/admin/content/messages"],
  ["相册", "/admin/content/album"],
  ["清单", "/admin/content/checklist"],
  ["设置", "/admin/settings/site"]
] as const;

export function AdminShell({ user, children }: { user: CurrentUser; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-blush-100 bg-blush-50/70 p-5 md:block">
        <Link href="/admin" className="text-lg font-semibold text-ink">
          Like Zhizhi
        </Link>
        <nav className="mt-8 grid gap-2 text-sm text-ink/70">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-2 hover:bg-white">
              {label}
            </Link>
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
