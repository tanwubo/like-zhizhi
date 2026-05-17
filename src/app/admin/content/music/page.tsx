import Link from "next/link";

import { AdminActionForm } from "@/components/admin/action-form";
import { AdminSection } from "@/components/admin/admin-section";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteMusicTrack } from "@/features/admin/music-actions";
import { getAdminMusicTracks } from "@/features/admin/music-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

function flagLabel(value: boolean) {
  return value ? "启用" : "停用";
}

export default async function AdminMusicPage() {
  const tracks = await getAdminMusicTracks();

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">音乐管理</h1>
          <p className="mt-1 text-sm text-ink/60">管理公开播放器可用的曲目、封面、音频地址和排序。</p>
        </div>
        <Link className="rounded-md bg-blush-600 px-4 py-2 text-sm font-medium text-white" href="/admin/content/music/new">
          新建音乐
        </Link>
      </div>
      <AdminSection title="音乐列表">
        {tracks.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-ink/50">
                <tr className="border-b border-blush-100">
                  <th className="py-2 pr-4 font-medium">标题</th>
                  <th className="py-2 pr-4 font-medium">歌手</th>
                  <th className="py-2 pr-4 font-medium">来源</th>
                  <th className="py-2 pr-4 font-medium">状态</th>
                  <th className="py-2 pr-4 font-medium">排序</th>
                  <th className="py-2 pr-4 font-medium">更新时间</th>
                  <th className="py-2 pr-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track) => (
                  <tr key={track.id} className="border-b border-blush-50 align-top">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-ink">{track.title}</p>
                      <p className="mt-1 break-all text-xs leading-5 text-ink/55">{track.sourceUrl}</p>
                    </td>
                    <td className="py-3 pr-4 text-ink/60">{track.artist}</td>
                    <td className="py-3 pr-4 text-ink/60">{track.sourceType}</td>
                    <td className="py-3 pr-4 text-ink/60">{flagLabel(track.enabled)}</td>
                    <td className="py-3 pr-4 text-ink/60">{track.sortOrder}</td>
                    <td className="py-3 pr-4 text-ink/60">{formatDateLabel(track.updatedAt)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-3">
                        <Link className="text-blush-700" href="/">
                          预览
                        </Link>
                        <Link className="text-blush-700" href={`/admin/content/music/${track.id}/edit`}>
                          编辑
                        </Link>
                        <AdminActionForm action={deleteMusicTrack}>
                          <input type="hidden" name="id" value={track.id} />
                          <DeleteButton className="text-ink/45 hover:text-blush-700">
                            删除
                          </DeleteButton>
                        </AdminActionForm>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-ink/60">暂无音乐，先添加一首公开播放器曲目。</p>
        )}
      </AdminSection>
    </div>
  );
}
