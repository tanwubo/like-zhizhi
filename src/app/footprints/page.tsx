import { PublicShell } from "@/components/layout/public-shell";
import { FootprintMapFallback } from "@/components/public/footprint-map-fallback";
import { FootprintMapShowcase } from "@/components/public/footprint-map-showcase";
import { getFootprintPlaces } from "@/features/public/public-content";
import { getPublicSiteData } from "@/features/public/site-data";

export const dynamic = "force-dynamic";

export default async function FootprintsPage() {
  const [publicData, places] = await Promise.all([getPublicSiteData(), getFootprintPlaces()]);
  const mapPlaces = places.map((place) => ({
    id: place.id,
    name: place.name,
    description: place.description,
    latitude: place.latitude.toString(),
    longitude: place.longitude.toString(),
    sortOrder: place.sortOrder,
    coverUrl: place.coverUrl,
    memories: place.memories.map((memory) => ({
      id: memory.id,
      locationName: memory.locationName,
      address: memory.address,
      visitedAt: memory.visitedAt,
      mood: memory.mood,
      story: memory.story,
      sortOrder: memory.sortOrder,
      images: memory.images.map((image) => ({
        id: image.id,
        url: image.mediaAsset.publicUrl,
        filename: image.mediaAsset.filename,
        caption: image.caption,
        sortOrder: image.sortOrder
      }))
    }))
  }));

  return (
    <PublicShell
      title={publicData.site.title}
      footerText={publicData.site.footerText}
      modules={publicData.navigation}
      theme={publicData.theme}
      variant="home"
    >
      <div className="min-h-[calc(100vh-60px)] bg-[#f5f5f7] text-[#1d1d1f]">
        {mapPlaces.length ? (
          <FootprintMapShowcase places={mapPlaces} />
        ) : (
          <FootprintMapFallback places={[]} reason="暂无可展示的城市。" />
        )}
      </div>
    </PublicShell>
  );
}
