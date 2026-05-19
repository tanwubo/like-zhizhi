"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { firstLitDate, formatFootprintDate, type PublicFootprintPlace } from "@/features/public/footprint-map-data";

export function FootprintDetailPanel({
  place,
  index,
  onClose,
  onPrev,
  onNext
}: {
  place: PublicFootprintPlace;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const litDate = firstLitDate(place);

  return (
    <aside className="footprint-detail-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-blush-700">
            第 {index + 1} 站{litDate ? ` · ${formatFootprintDate(litDate)} 首次点亮` : ""}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">{place.name}</h2>
          {place.description ? <p className="mt-2 text-sm leading-6 text-ink/60">{place.description}</p> : null}
        </div>
        <button
          aria-label="关闭"
          className="rounded-full p-2 text-ink/50 hover:bg-blush-50 hover:text-ink"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 grid gap-5">
        {place.memories.map((memory) => (
          <article key={memory.id} className="grid gap-3">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                {formatFootprintDate(memory.visitedAt)} · {memory.locationName}
              </h3>
              {memory.mood ? <p className="mt-1 text-sm text-blush-700">{memory.mood}</p> : null}
              {memory.story ? <p className="mt-2 text-sm leading-6 text-ink/65">{memory.story}</p> : null}
            </div>
            {memory.images.length ? (
              <div className="grid grid-cols-3 gap-2">
                {memory.images.map((image) => (
                  // eslint-disable-next-line @next/next/no-img-element -- memory media may be served from user-configured storage hosts
                  <img
                    key={image.id}
                    alt={image.caption || image.filename}
                    className="aspect-square w-full rounded-md object-cover"
                    src={image.url}
                  />
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="mt-5 flex justify-between">
        <button
          className="inline-flex items-center gap-1 rounded-md border border-blush-100 px-3 py-2 text-sm text-ink/70"
          onClick={onPrev}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
          上一站
        </button>
        <button
          className="inline-flex items-center gap-1 rounded-md border border-blush-100 px-3 py-2 text-sm text-ink/70"
          onClick={onNext}
          type="button"
        >
          下一站
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
