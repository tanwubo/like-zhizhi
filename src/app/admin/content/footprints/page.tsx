import Link from "next/link";

import { AdminActionForm } from "@/components/admin/action-form";
import { AdminSection } from "@/components/admin/admin-section";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteFootprintPlace } from "@/features/admin/footprint-actions";
import { getAdminFootprintPlaces } from "@/features/admin/footprint-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AdminFootprintsPage() {
  const places = await getAdminFootprintPlaces();

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">足迹管理</h1>
          <p className="mt-1 text-sm text-ink/60">管理城市节点、点亮顺序、记忆和照片。</p>
        </div>
        <Link
          className="rounded-md bg-blush-600 px-4 py-2 text-sm font-medium text-white"
          href="/admin/content/footprints/new"
        >
          新建足迹
        </Link>
      </div>
      <AdminSection title="足迹列表">
        {places.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="text-ink/50">
                <tr className="border-b border-blush-100">
                  <th className="py-2 pr-4 font-medium">城市</th>
                  <th className="py-2 pr-4 font-medium">排序</th>
                  <th className="py-2 pr-4 font-medium">状态</th>
                  <th className="py-2 pr-4 font-medium">坐标</th>
                  <th className="py-2 pr-4 font-medium">记忆</th>
                  <th className="py-2 pr-4 font-medium">照片</th>
                  <th className="py-2 pr-4 font-medium">最近点亮</th>
                  <th className="py-2 pr-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => {
                  const imageCount = place.memories.reduce((count, memory) => count + memory.images.length, 0);
                  const latestMemory = place.memories[0];

                  return (
                    <tr key={place.id} className="border-b border-blush-50 align-top">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-ink">{place.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/55">
                          {place.description || place.coverUrl || "-"}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-ink/60">{place.sortOrder}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-blush-50 px-2 py-1 text-xs text-blush-700">
                          {place.enabled ? "展示中" : "已隐藏"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-ink/60">
                        {place.latitude.toString()}, {place.longitude.toString()}
                      </td>
                      <td className="py-3 pr-4 text-ink/60">{place.memories.length}</td>
                      <td className="py-3 pr-4 text-ink/60">{imageCount}</td>
                      <td className="py-3 pr-4">
                        {latestMemory ? (
                          <div>
                            <p className="font-medium text-ink/75">{formatDateLabel(latestMemory.visitedAt)}</p>
                            <p className="mt-1 line-clamp-1 text-xs text-ink/50">
                              {latestMemory.mood || latestMemory.locationName}
                            </p>
                          </div>
                        ) : (
                          <span className="text-ink/45">暂无记忆</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-3">
                          <Link className="text-blush-700" href="/footprints">
                            预览
                          </Link>
                          <Link className="text-blush-700" href={`/admin/content/footprints/${place.id}/edit`}>
                            编辑
                          </Link>
                          <AdminActionForm action={deleteFootprintPlace}>
                            <input type="hidden" name="id" value={place.id} />
                            <DeleteButton className="text-ink/45 hover:text-blush-700" message="确认删除这个城市及其记忆？">
                              删除
                            </DeleteButton>
                          </AdminActionForm>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-ink/60">暂无足迹，先登记一个城市。</p>
        )}
      </AdminSection>
    </div>
  );
}
