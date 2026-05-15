import { MediaType } from "@prisma/client";
import Image from "next/image";

import { PublicShell } from "@/components/layout/public-shell";
import { EmptyState } from "@/components/public/empty-state";
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
    >
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl font-semibold text-ink">相册</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {items.length ? (
            items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-lg border border-blush-100 bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-blush-50">
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
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-ink">{item.title}</h2>
                    <span className="text-xs text-ink/45">{item.location ?? "照片"}</span>
                  </div>
                  {item.caption ? <p className="mt-3 text-sm leading-6 text-ink/65">{item.caption}</p> : null}
                </div>
              </article>
            ))
          ) : (
            <EmptyState title="暂无相册" description="上传并发布照片后会展示在这里。" />
          )}
        </div>
      </section>
    </PublicShell>
  );
}
