import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { deleteFootprintPlace, deleteFootprintVisit } from "@/features/admin/footprint-actions";
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
          <p className="mt-1 text-sm text-ink/60">管理地点、坐标、封面和访问记录。</p>
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
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="text-ink/50">
                <tr className="border-b border-blush-100">
                  <th className="py-2 pr-4 font-medium">地点</th>
                  <th className="py-2 pr-4 font-medium">坐标</th>
                  <th className="py-2 pr-4 font-medium">访问记录</th>
                  <th className="py-2 pr-4 font-medium">更新时间</th>
                  <th className="py-2 pr-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => (
                  <tr key={place.id} className="border-b border-blush-50 align-top">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-ink">{place.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/55">
                        {place.description || place.coverUrl || "-"}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-ink/60">
                      {place.latitude.toString()}, {place.longitude.toString()}
                    </td>
                    <td className="py-3 pr-4">
                      {place.visits.length ? (
                        <div className="grid gap-2">
                          {place.visits.map((visit) => (
                            <div key={visit.id} className="text-ink/65">
                              <p className="font-medium text-ink/75">
                                {visit.title} · {formatDateLabel(visit.visitedAt)}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-3">
                                <p className="line-clamp-1 text-xs text-ink/50">{visit.description}</p>
                                <form action={deleteFootprintVisit}>
                                  <input type="hidden" name="id" value={visit.id} />
                                  <button className="text-xs text-ink/45 hover:text-blush-700" type="submit">
                                    删除记录
                                  </button>
                                </form>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-ink/45">暂无记录</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-ink/60">{formatDateLabel(place.updatedAt)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-3">
                        <Link className="text-blush-700" href="/footprints">
                          预览
                        </Link>
                        <Link className="text-blush-700" href={`/admin/content/footprints/${place.id}/edit`}>
                          编辑
                        </Link>
                        <form action={deleteFootprintPlace}>
                          <input type="hidden" name="id" value={place.id} />
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
          <p className="text-sm text-ink/60">暂无足迹，先登记一个地点。</p>
        )}
      </AdminSection>
    </div>
  );
}
