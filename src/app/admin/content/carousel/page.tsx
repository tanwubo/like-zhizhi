import Link from "next/link";

import { AdminActionForm } from "@/components/admin/action-form";
import { AdminSection } from "@/components/admin/admin-section";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteCarouselSlide, moveCarouselSlide } from "@/features/admin/carousel-actions";
import { getAdminCarouselSlides } from "@/features/admin/carousel-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AdminCarouselPage() {
  const slides = await getAdminCarouselSlides();
  const enabledSlides = slides.filter((slide) => slide.enabled);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">轮播图管理</h1>
          <p className="mt-1 text-sm text-ink/60">管理首页头部轮播图素材、排序、跳转地址和启用状态。</p>
        </div>
        <Button asChild>
          <Link href="/admin/content/carousel/new">新增轮播图</Link>
        </Button>
      </div>
      <AdminSection title="轮播效果预览">
        {enabledSlides.length ? (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative min-h-[260px] overflow-hidden rounded-lg bg-blush-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={enabledSlides[0].title} className="absolute inset-0 h-full w-full object-cover" src={enabledSlides[0].imageUrl} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/65 to-transparent p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">当前第一张</p>
                <h2 className="mt-1 text-xl font-semibold">{enabledSlides[0].title}</h2>
                {enabledSlides[0].description ? <p className="mt-2 text-sm opacity-85">{enabledSlides[0].description}</p> : null}
              </div>
            </div>
            <div className="grid content-start gap-3">
              {enabledSlides.map((slide, index) => (
                <a
                  key={slide.id}
                  className="grid grid-cols-[88px_1fr] gap-3 rounded-md border border-blush-100 bg-white p-2 text-sm transition hover:border-blush-300"
                  href={slide.imageUrl}
                  rel="noreferrer"
                  target="_blank"
                  aria-label={`预览${slide.title}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" className="h-14 w-[88px] rounded object-cover" src={slide.imageUrl} />
                  <span className="min-w-0">
                    <span className="block font-medium text-ink">
                      {index + 1}. {slide.title}
                    </span>
                    <span className="mt-1 block truncate text-xs text-ink/55">{slide.imageUrl}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <p className="text-sm text-ink/60">暂无启用的轮播图，启用后会在这里预览首页头部背景。</p>
            <Button asChild className="w-fit">
              <Link href="/admin/content/carousel/new">新增轮播图</Link>
            </Button>
          </div>
        )}
      </AdminSection>
      <AdminSection title="轮播图列表">
        {slides.length ? (
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow>
                <TableHead>素材</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>调整顺序</TableHead>
                <TableHead>跳转地址</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {slides.map((slide) => (
                  <TableRow key={slide.id} className="align-top">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt={slide.title} className="h-14 w-24 rounded-md object-cover" src={slide.imageUrl} />
                        <div>
                          <p className="font-medium text-ink">{slide.title}</p>
                          <p className="mt-1 line-clamp-1 text-xs text-ink/55">{slide.description || slide.imageUrl}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={slide.enabled ? "secondary" : "outline"}>{slide.enabled ? "启用" : "停用"}</Badge>
                    </TableCell>
                    <TableCell className="text-ink/60">{slide.sortOrder}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <AdminActionForm action={moveCarouselSlide}>
                          <input type="hidden" name="id" value={slide.id} />
                          <input type="hidden" name="direction" value="up" />
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={slides[0]?.id === slide.id}
                            type="submit"
                          >
                            上移
                          </Button>
                        </AdminActionForm>
                        <AdminActionForm action={moveCarouselSlide}>
                          <input type="hidden" name="id" value={slide.id} />
                          <input type="hidden" name="direction" value="down" />
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={slides[slides.length - 1]?.id === slide.id}
                            type="submit"
                          >
                            下移
                          </Button>
                        </AdminActionForm>
                      </div>
                    </TableCell>
                    <TableCell className="text-ink/60">{slide.linkUrl ?? "-"}</TableCell>
                    <TableCell className="text-ink/60">{formatDateLabel(slide.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-3">
                        <a className="text-ink/55 hover:text-blush-700" href={slide.imageUrl} rel="noreferrer" target="_blank">
                          预览
                        </a>
                        <Link className="text-blush-700" href={`/admin/content/carousel/${slide.id}/edit`}>
                          编辑
                        </Link>
                        <AdminActionForm action={deleteCarouselSlide}>
                          <input type="hidden" name="id" value={slide.id} />
                          <DeleteButton className="text-ink/45 hover:text-blush-700">删除</DeleteButton>
                        </AdminActionForm>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid gap-4">
            <p className="text-sm text-ink/60">暂无轮播图，新增后会展示在首页头部。</p>
            <Button asChild className="w-fit">
              <Link href="/admin/content/carousel/new">新增轮播图</Link>
            </Button>
          </div>
        )}
      </AdminSection>
    </div>
  );
}
