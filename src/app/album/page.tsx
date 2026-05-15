import { PublicShell } from "@/components/layout/public-shell";
import { ContentCard } from "@/components/public/content-card";
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
              <ContentCard key={item.id} title={item.title} meta={item.location ?? "照片"}>
                {item.caption}
              </ContentCard>
            ))
          ) : (
            <EmptyState title="暂无相册" description="上传并发布照片后会展示在这里。" />
          )}
        </div>
      </section>
    </PublicShell>
  );
}
