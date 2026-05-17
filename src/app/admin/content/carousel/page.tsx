import Link from "next/link";

import { AdminActionForm } from "@/components/admin/action-form";
import { AdminSection } from "@/components/admin/admin-section";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCarouselSlide } from "@/features/admin/carousel-actions";
import { getAdminCarouselSlides } from "@/features/admin/carousel-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AdminCarouselPage() {
  const slides = await getAdminCarouselSlides();

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">轮播图管理</h1>
          <p className="mt-1 text-sm text-ink/60">管理首页头部轮播图素材、排序、跳转地址和启用状态。</p>
        </div>
        <Link className="rounded-md bg-blush-600 px-4 py-2 text-sm font-medium text-white" href="/admin/content/carousel/new">
          新增轮播图
        </Link>
      </div>
      <AdminSection title="轮播图列表">
        {slides.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-ink/50">
                <tr className="border-b border-blush-100">
                  <th className="py-2 pr-4 font-medium">素材</th>
                  <th className="py-2 pr-4 font-medium">状态</th>
                  <th className="py-2 pr-4 font-medium">排序</th>
                  <th className="py-2 pr-4 font-medium">跳转地址</th>
                  <th className="py-2 pr-4 font-medium">更新时间</th>
                  <th className="py-2 pr-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {slides.map((slide) => (
                  <tr key={slide.id} className="border-b border-blush-50 align-top">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt={slide.title} className="h-14 w-24 rounded-md object-cover" src={slide.imageUrl} />
                        <div>
                          <p className="font-medium text-ink">{slide.title}</p>
                          <p className="mt-1 line-clamp-1 text-xs text-ink/55">{slide.description || slide.imageUrl}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-ink/70">{slide.enabled ? "启用" : "停用"}</td>
                    <td className="py-3 pr-4 text-ink/60">{slide.sortOrder}</td>
                    <td className="py-3 pr-4 text-ink/60">{slide.linkUrl ?? "-"}</td>
                    <td className="py-3 pr-4 text-ink/60">{formatDateLabel(slide.updatedAt)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-3">
                        <Link className="text-blush-700" href={`/admin/content/carousel/${slide.id}/edit`}>
                          编辑
                        </Link>
                        <AdminActionForm action={deleteCarouselSlide}>
                          <input type="hidden" name="id" value={slide.id} />
                          <DeleteButton className="text-ink/45 hover:text-blush-700">删除</DeleteButton>
                        </AdminActionForm>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-ink/60">暂无轮播图，新增后会展示在首页头部。</p>
        )}
      </AdminSection>
    </div>
  );
}
