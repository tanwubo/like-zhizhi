import { PublicShell } from "@/components/layout/public-shell";
import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { getFootprintPlaces } from "@/features/public/public-content";
import { getPublicSiteData } from "@/features/public/site-data";

export const dynamic = "force-dynamic";

export default async function FootprintsPage() {
  const [publicData, places] = await Promise.all([getPublicSiteData(), getFootprintPlaces()]);

  return (
    <PublicShell
      title={publicData.site.title}
      footerText={publicData.site.footerText}
      modules={publicData.navigation}
    >
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl font-semibold text-ink">轨迹</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {places.length ? (
            places.map((place) => (
              <ContentCard key={place.id} title={place.name} meta={`${place.latitude}, ${place.longitude}`}>
                {place.description}
              </ContentCard>
            ))
          ) : (
            <EmptyState title="暂无轨迹" description="记录地点后会展示在这里。" />
          )}
        </div>
      </section>
    </PublicShell>
  );
}
