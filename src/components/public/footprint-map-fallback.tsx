import { EmptyState } from "@/components/public/empty-state";
import type { PublicFootprintPlace } from "@/features/public/footprint-map-data";

export function FootprintMapFallback({ places, reason }: { places: PublicFootprintPlace[]; reason: string }) {
  if (!places.length) {
    return <EmptyState title="暂无轨迹" description="记录城市后会展示在这里。" />;
  }

  return (
    <section className="mx-auto grid max-w-[1100px] gap-3 px-4 pb-12 md:grid-cols-2">
      <div className="rounded-md border border-blush-100 bg-white/80 p-4 text-sm text-ink/60 md:col-span-2">
        {reason}
      </div>
      {places.map((place, index) => (
        <article key={place.id} className="rounded-md border border-blush-100 bg-white p-4">
          <p className="text-xs text-blush-700">第 {index + 1} 站</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">{place.name}</h2>
          <p className="mt-2 text-sm text-ink/60">{place.description || "等一张照片和一段故事来点亮这里。"}</p>
        </article>
      ))}
    </section>
  );
}
