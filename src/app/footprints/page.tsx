import { PublicShell } from "@/components/layout/public-shell";
import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { PageHeader } from "@/components/public/page-header";
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
      theme={publicData.theme}
      variant="home"
    >
      <div className="min-h-[calc(100vh-60px)] bg-[#f5f5f7] text-[#1d1d1f]">
        <PageHeader eyebrow="Footprints" title="轨迹" description="记录一起到过的地方，也记录出发时的心情。" />
        <section className="mx-auto grid max-w-[1200px] gap-4 px-4 pb-12 md:grid-cols-2 md:px-6">
          {places.length ? (
            places.map((place) => (
              <ContentCard key={place.id} title={place.name} meta={`${place.latitude}, ${place.longitude}`}>
                {place.description}
              </ContentCard>
            ))
          ) : (
            <div className="md:col-span-2">
              <EmptyState title="暂无轨迹" description="记录地点后会展示在这里。" />
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
