import { PublishStatus } from "@prisma/client";
import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { deleteNote } from "@/features/admin/notes-actions";
import { getAdminNotes } from "@/features/admin/notes-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

const statusLabels: Record<PublishStatus, string> = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  HIDDEN: "已隐藏"
};

export default async function AdminNotesPage() {
  const notes = await getAdminNotes();

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">点滴管理</h1>
          <p className="mt-1 text-sm text-ink/60">管理公开点滴、草稿和隐藏内容。</p>
        </div>
        <Link className="rounded-md bg-blush-600 px-4 py-2 text-sm font-medium text-white" href="/admin/content/notes/new">
          新建点滴
        </Link>
      </div>
      <AdminSection title="点滴列表">
        {notes.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-ink/50">
                <tr className="border-b border-blush-100">
                  <th className="py-2 pr-4 font-medium">标题</th>
                  <th className="py-2 pr-4 font-medium">状态</th>
                  <th className="py-2 pr-4 font-medium">链接</th>
                  <th className="py-2 pr-4 font-medium">更新时间</th>
                  <th className="py-2 pr-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr key={note.id} className="border-b border-blush-50 align-top">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-ink">{note.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/55">{note.excerpt}</p>
                    </td>
                    <td className="py-3 pr-4 text-ink/70">{statusLabels[note.status]}</td>
                    <td className="py-3 pr-4 text-ink/60">{note.slug}</td>
                    <td className="py-3 pr-4 text-ink/60">{formatDateLabel(note.updatedAt)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-3">
                        {note.status === PublishStatus.PUBLISHED ? (
                          <Link className="text-blush-700" href={`/notes/${note.slug}`}>
                            预览
                          </Link>
                        ) : null}
                        <Link className="text-blush-700" href={`/admin/content/notes/${note.id}/edit`}>
                          编辑
                        </Link>
                        <form action={deleteNote}>
                          <input type="hidden" name="id" value={note.id} />
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
          <p className="text-sm text-ink/60">暂无点滴，先新建一条草稿。</p>
        )}
      </AdminSection>
    </div>
  );
}
