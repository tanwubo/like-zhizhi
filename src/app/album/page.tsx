import { MediaType } from "@prisma/client";
import Image from "next/image";

import { PublicShell } from "@/components/layout/public-shell";
import { EmptyState } from "@/components/public/empty-state";
import { PageHeader } from "@/components/public/page-header";
import { getAlbumItems } from "@/features/public/public-content";
import { getPublicSiteData } from "@/features/public/site-data";

export const dynamic = "force-dynamic";

export default async function AlbumPage() {
  const [publicData, items] = await Promise.all([getPublicSiteData(), getAlbumItems()]);

  return (
    <PublicShell
      title={publicData.site.title}
      footerText={publicData.site.footerText}
      modules={publicData.navigation}
      people={publicData.people}
      theme={publicData.theme}
      variant="home"
    >
      <div className="min-h-[calc(100vh-60px)] bg-[#f5f5f7] text-[#1d1d1f]">
        <PageHeader eyebrow="Photo Album" title="相册" description="把走过的风景和一起停留的瞬间收好。" />
        <section className="mx-auto grid max-w-[1200px] gap-4 px-4 pb-12 md:grid-cols-2 lg:grid-cols-3 md:px-6">
          {items.length ? (
            items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-[#d2d2d7] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.08)]"
              >
                <div className="relative aspect-[4/3] bg-[rgba(0,122,255,0.08)]">
                  {item.media.type === MediaType.VIDEO ? (
                    <video className="h-full w-full object-cover" controls preload="metadata" src={item.media.publicUrl}>
                      <track kind="captions" />
                    </video>
                  ) : (
                    <Image
                      alt={item.title}
                      className="h-full w-full object-cover"
                      fill
                      loading="lazy"
                      src={item.media.publicUrl}
                      unoptimized
                    />
                  )}
                  {item.takenAt ? (
                    <time
                      className="absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium leading-none text-white shadow-sm backdrop-blur"
                      dateTime={item.takenAt.toISOString()}
                    >
                      {formatTakenAt(item.takenAt)}
                    </time>
                  ) : null}
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-[#1d1d1f]">{item.title}</h2>
                    <span className="rounded-full bg-[rgba(0,122,255,0.08)] px-2.5 py-1 text-xs font-medium text-[#007aff]">
                      {item.location ?? "照片"}
                    </span>
                  </div>
                  {item.caption ? <p className="mt-3 text-sm leading-6 text-[#6e6e73]">{item.caption}</p> : null}
                </div>
              </article>
            ))
          ) : (
            <div className="md:col-span-2 lg:col-span-3">
              <EmptyState title="暂无相册" description="上传并发布照片后会展示在这里。" />
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}

function formatTakenAt(date: Date) {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}
