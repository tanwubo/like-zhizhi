import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { deleteLoveDayEvent } from "@/features/admin/love-days-actions";
import { getAdminLoveDayEvents } from "@/features/admin/love-days-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

function flagLabel(value: boolean) {
  return value ? "是" : "否";
}

export default async function AdminLoveDaysPage() {
  const events = await getAdminLoveDayEvents();

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">纪念日管理</h1>
          <p className="mt-1 text-sm text-ink/60">管理周年、倒计时、重复标记和排序。</p>
        </div>
        <Link
          className="rounded-md bg-blush-600 px-4 py-2 text-sm font-medium text-white"
          href="/admin/content/love-days/new"
        >
          新建纪念日
        </Link>
      </div>
      <AdminSection title="纪念日列表">
        {events.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-ink/50">
                <tr className="border-b border-blush-100">
                  <th className="py-2 pr-4 font-medium">标题</th>
                  <th className="py-2 pr-4 font-medium">日期</th>
                  <th className="py-2 pr-4 font-medium">每年重复</th>
                  <th className="py-2 pr-4 font-medium">农历</th>
                  <th className="py-2 pr-4 font-medium">排序</th>
                  <th className="py-2 pr-4 font-medium">更新时间</th>
                  <th className="py-2 pr-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-blush-50 align-top">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-ink">{event.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/55">{event.description}</p>
                    </td>
                    <td className="py-3 pr-4 text-ink/60">{formatDateLabel(event.date)}</td>
                    <td className="py-3 pr-4 text-ink/60">{flagLabel(event.yearly)}</td>
                    <td className="py-3 pr-4 text-ink/60">{flagLabel(event.lunar)}</td>
                    <td className="py-3 pr-4 text-ink/60">{event.sortOrder}</td>
                    <td className="py-3 pr-4 text-ink/60">{formatDateLabel(event.updatedAt)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-3">
                        <Link className="text-blush-700" href="/love-days">
                          预览
                        </Link>
                        <Link className="text-blush-700" href={`/admin/content/love-days/${event.id}/edit`}>
                          编辑
                        </Link>
                        <form action={deleteLoveDayEvent}>
                          <input type="hidden" name="id" value={event.id} />
                          <button className="text-ink/45 hover:text-blush-700" type="submit">
                            删除
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-ink/60">暂无纪念日，先新建一个重要日期。</p>
        )}
      </AdminSection>
    </div>
  );
}
