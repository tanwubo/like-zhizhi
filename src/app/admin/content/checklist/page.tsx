import { PublishStatus } from "@prisma/client";
import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteChecklistItem } from "@/features/admin/checklist-actions";
import { getAdminChecklistItems } from "@/features/admin/checklist-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

const statusLabels: Record<PublishStatus, string> = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  HIDDEN: "已隐藏"
};

function optionalDateLabel(date?: Date | null) {
  return date ? formatDateLabel(date) : "-";
}

export default async function AdminChecklistPage() {
  const items = await getAdminChecklistItems();

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">清单管理</h1>
          <p className="mt-1 text-sm text-ink/60">管理愿望、计划、完成状态、目标日期和发布状态。</p>
        </div>
        <Link
          className="rounded-md bg-blush-600 px-4 py-2 text-sm font-medium text-white"
          href="/admin/content/checklist/new"
        >
          新建清单
        </Link>
      </div>
      <AdminSection title="清单列表">
        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-ink/50">
                <tr className="border-b border-blush-100">
                  <th className="py-2 pr-4 font-medium">标题</th>
                  <th className="py-2 pr-4 font-medium">状态</th>
                  <th className="py-2 pr-4 font-medium">完成</th>
                  <th className="py-2 pr-4 font-medium">目标日期</th>
                  <th className="py-2 pr-4 font-medium">位置</th>
                  <th className="py-2 pr-4 font-medium">更新时间</th>
                  <th className="py-2 pr-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-blush-50 align-top">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-ink">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/55">{item.description || item.imageUrl || "-"}</p>
                    </td>
                    <td className="py-3 pr-4 text-ink/70">{statusLabels[item.status]}</td>
                    <td className="py-3 pr-4 text-ink/60">
                      {item.completed ? `已完成 ${optionalDateLabel(item.completedAt)}` : "进行中"}
                    </td>
                    <td className="py-3 pr-4 text-ink/60">{optionalDateLabel(item.targetDate)}</td>
                    <td className="py-3 pr-4 text-ink/60">{item.location ?? "-"}</td>
                    <td className="py-3 pr-4 text-ink/60">{formatDateLabel(item.updatedAt)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-3">
                        {item.status === PublishStatus.PUBLISHED ? (
                          <Link className="text-blush-700" href="/checklist">
                            预览
                          </Link>
                        ) : null}
                        <Link className="text-blush-700" href={`/admin/content/checklist/${item.id}/edit`}>
                          编辑
                        </Link>
                        <form action={deleteChecklistItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <DeleteButton className="text-ink/45 hover:text-blush-700">
                            删除
                          </DeleteButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-ink/60">暂无清单，先新建一个愿望或计划。</p>
        )}
      </AdminSection>
    </div>
  );
}
