"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { FootprintDetailPanel } from "@/components/public/footprint-detail-panel";
import { FootprintMapFallback } from "@/components/public/footprint-map-fallback";
import {
  selectMarkerThumbnails,
  toJourneyLabel,
  type PublicFootprintPlace
} from "@/features/public/footprint-map-data";
import { loadAMap } from "@/lib/amap-loader";

type AMapPixel = new (x: number, y: number) => unknown;
type AMapMarkerInstance = {
  getContent: () => HTMLElement;
};
type AMapPolylineInstance = {
  setPath: (path: number[][]) => void;
};
type AMapInstance = {
  add: (item: unknown) => void;
  addControl: (control: unknown) => void;
  destroy: () => void;
  getZoom: () => number;
  on: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
  setCenter: (center: number[], immediately?: boolean, duration?: number) => void;
  setFitView: (overlays: unknown[], immediately?: boolean, padding?: [number, number, number, number]) => void;
};
type AMapMarkerOptions = {
  position: number[];
  content: HTMLElement;
  offset: unknown;
};
type AMapNamespace = {
  Map: new (
    container: HTMLDivElement,
    options: { viewMode: "3D"; zoom: number; center: number[]; mapStyle: string }
  ) => AMapInstance;
  Marker: new (options: AMapMarkerOptions) => AMapMarkerInstance;
  Pixel: AMapPixel;
  Polyline: new (options: {
    path: number[][];
    isOutline: boolean;
    outlineColor: string;
    borderWeight: number;
    strokeColor: string;
    strokeOpacity: number;
    strokeWeight: number;
    strokeStyle: "dashed" | "solid";
    strokeDasharray: number[];
    lineJoin: "round";
    lineCap: "round";
    zIndex: number;
  }) => AMapPolylineInstance;
  Scale: new () => unknown;
};

function cityPosition(place: PublicFootprintPlace) {
  return [Number(place.longitude), Number(place.latitude)];
}

function interpolatePosition(from: number[], to: number[], progress: number) {
  return [from[0] + (to[0] - from[0]) * progress, from[1] + (to[1] - from[1]) * progress];
}

function createMarkerContent(place: PublicFootprintPlace, index: number, onSelect: () => void) {
  const content = document.createElement("button");
  content.type = "button";
  content.className = "footprint-map-marker is-hidden";
  content.setAttribute("aria-label", `打开${place.name}足迹`);

  const label = document.createElement("div");
  label.className = "marker-label";

  const order = document.createElement("span");
  order.className = "marker-order";
  order.textContent = String(index + 1);
  label.append(order);

  const name = document.createElement("span");
  name.className = "marker-name";
  name.textContent = place.name;
  label.append(name);
  content.append(label);

  const anchor = document.createElement("div");
  anchor.className = "marker-anchor";

  const pulse = document.createElement("div");
  pulse.className = "marker-pulse";
  anchor.append(pulse);

  const dot = document.createElement("div");
  dot.className = "marker-dot";
  anchor.append(dot);
  content.append(anchor);

  const gallery = document.createElement("div");
  gallery.className = "marker-gallery";
  const thumbs = selectMarkerThumbnails(place);
  for (const thumbnail of thumbs) {
    const card = document.createElement("div");
    card.className = "gallery-card";
    const img = document.createElement("img");
    img.alt = thumbnail.filename;
    img.src = thumbnail.url;
    card.append(img);
    gallery.append(card);
  }
  content.append(gallery);
  content.addEventListener("click", onSelect);

  return content;
}

export function FootprintMapShowcase({ places }: { places: PublicFootprintPlace[] }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<AMapInstance | null>(null);
  const markersRef = useRef<AMapMarkerInstance[]>([]);
  const routeRef = useRef<AMapPolylineInstance | null>(null);
  const animationRef = useRef<number | null>(null);
  const animatingRef = useRef(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const routePath = useMemo(
    () => places.slice(0, Math.max(0, revealedCount + 1)).map(cityPosition),
    [places, revealedCount]
  );

  useEffect(() => {
    if (!mapRef.current || !places.length) {
      return;
    }

    let map: AMapInstance | null = null;
    let disposed = false;
    setMapReady(false);

    loadAMap({
      key: process.env.NEXT_PUBLIC_AMAP_JSAPI_KEY,
      securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE,
      serviceHost: process.env.NEXT_PUBLIC_AMAP_SERVICE_HOST,
      plugins: ["AMap.Scale"]
    }).then((result) => {
      if (disposed) {
        return;
      }

      if (!result.ok) {
        setFailed(result.reason === "missing-key" ? "未配置高德地图 Key，先显示轨迹列表。" : "高德地图加载失败，先显示轨迹列表。");
        return;
      }

      const AMap = result.AMap as AMapNamespace;
      map = new AMap.Map(mapRef.current as HTMLDivElement, {
        viewMode: "3D",
        zoom: 6.2,
        center: cityPosition(places[0]),
        mapStyle: "amap://styles/light"
      });
      mapInstanceRef.current = map;
      map.addControl(new AMap.Scale());

      const route = new AMap.Polyline({
        path: places.slice(0, 1).map(cityPosition),
        isOutline: true,
        outlineColor: "#fff7fb",
        borderWeight: 3,
        strokeColor: "#ff6b8b",
        strokeOpacity: 0.85,
        strokeWeight: 4,
        strokeStyle: "dashed",
        strokeDasharray: [10, 8],
        lineJoin: "round",
        lineCap: "round",
        zIndex: 20
      });
      routeRef.current = route;
      map.add(route);

      const markers = places.map((place, index) => {
        const content = createMarkerContent(place, index, () => {
          setRevealedCount(places.length - 1);
          setActiveIndex(index);
          setSelectedIndex(index);
        });
        const marker = new AMap.Marker({
          position: cityPosition(place),
          content,
          offset: new AMap.Pixel(0, 0)
        });
        return marker;
      });
      markersRef.current = markers;
      map.add(markers);

      // 动态校准 offset，让 anchor（地点标识）中心对准坐标点
      window.requestAnimationFrame(() => {
        for (const marker of markers) {
          const el = marker.getContent();
          const anchor = el.querySelector(".marker-anchor") as HTMLElement | null;
          if (!anchor) continue;
          const contentRect = el.getBoundingClientRect();
          const anchorRect = anchor.getBoundingClientRect();
          const offsetX = -(anchorRect.left - contentRect.left + anchorRect.width / 2);
          const offsetY = -(anchorRect.top - contentRect.top + anchorRect.height / 2);
          (marker as unknown as { setOffset: (offset: unknown) => void }).setOffset(new AMap.Pixel(offsetX, offsetY));
        }
      });

      // zoom 联动：缩略图随地图放大而放大
      const updateGalleryScale = () => {
        const zoom = map.getZoom();
        // 基准 zoom=6.2 时 scale=1，每增加 1 级 zoom 增加 0.18
        const scale = Math.max(0.5, Math.min(2.5, 0.1 + zoom * 0.18));
        for (const marker of markers) {
          const gallery = marker.getContent().querySelector(".marker-gallery") as HTMLElement | null;
          if (gallery) {
            gallery.style.transform = `scale(${scale})`;
          }
        }
      };
      map.on("zoomend", updateGalleryScale);
      window.requestAnimationFrame(updateGalleryScale);

      setMapReady(true);
    });

    return () => {
      disposed = true;
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }
      mapInstanceRef.current = null;
      markersRef.current = [];
      routeRef.current = null;
      map?.destroy();
    };
  }, [places]);

  useEffect(() => {
    for (const [index, marker] of markersRef.current.entries()) {
      const content = marker.getContent();
      content.classList.toggle("is-hidden", index > revealedCount);
      content.classList.toggle("is-active", index === activeIndex && index <= revealedCount);
    }
    if (!animatingRef.current) {
      routeRef.current?.setPath(routePath);
    }
  }, [activeIndex, mapReady, revealedCount, routePath]);

  useEffect(() => {
    if (!mapReady || !places.length || revealedCount >= places.length - 1 || selectedIndex !== null) {
      return;
    }

    const map = mapInstanceRef.current;
    const route = routeRef.current;
    if (!map || !route) {
      return;
    }

    const startIndex = revealedCount;
    const endIndex = revealedCount + 1;
    const startPosition = cityPosition(places[startIndex]);
    const endPosition = cityPosition(places[endIndex]);
    const stablePath = places.slice(0, startIndex + 1).map(cityPosition);
    const duration = 3000;
    const startedAt = window.performance.now();

    animatingRef.current = true;

    const frame = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentPosition = interpolatePosition(startPosition, endPosition, easedProgress);

      route.setPath([...stablePath, currentPosition]);
      map.setCenter(currentPosition, true);

      if (progress < 1) {
        animationRef.current = window.requestAnimationFrame(frame);
        return;
      }

      animatingRef.current = false;
      animationRef.current = null;
      setRevealedCount(endIndex);
      setActiveIndex(endIndex);
    };

    animationRef.current = window.requestAnimationFrame(frame);

    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      animatingRef.current = false;
    };
  }, [mapReady, places, places.length, revealedCount, selectedIndex]);

  if (failed) {
    return <FootprintMapFallback places={places} reason={failed} />;
  }

  return (
    <section className="footprint-map-shell">
      <aside className="footprint-journey-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blush-700">Journey</p>
        <h2 className="mt-2 text-lg font-semibold text-ink">点亮顺序</h2>
        <div className="mt-4 grid gap-2">
          {places.map((place, index) => (
            <button
              key={place.id}
              className={index <= revealedCount ? "is-lit" : ""}
              onClick={() => {
                setRevealedCount(places.length - 1);
                setActiveIndex(index);
                setSelectedIndex(index);
              }}
              type="button"
            >
              <span>{index + 1}</span>
              {place.name}
            </button>
          ))}
        </div>
        <button
          className="mt-4 rounded-md border border-blush-100 px-3 py-2 text-sm text-ink/65 hover:border-blush-200 hover:text-blush-700"
          onClick={() => {
            setRevealedCount(places.length - 1);
            setActiveIndex(places.length - 1);
            mapInstanceRef.current?.setFitView(
              [...markersRef.current, routeRef.current].filter(Boolean),
              false,
              [80, 80, 80, 80]
            );
          }}
          type="button"
        >
          跳过动画
        </button>
        <p className="mt-3 text-xs text-ink/45">
          已点亮 {Math.min(revealedCount + 1, places.length)} / {places.length}
        </p>
      </aside>

      <div ref={mapRef} className="footprint-map-canvas" />

      {selectedIndex !== null ? (
        <FootprintDetailPanel
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNext={() => setSelectedIndex((selectedIndex + 1) % places.length)}
          onPrev={() => setSelectedIndex((selectedIndex + places.length - 1) % places.length)}
          place={places[selectedIndex]}
        />
      ) : null}

      <div className="footprint-map-caption">
        <p>{toJourneyLabel(activeIndex)}</p>
        <strong>{places[activeIndex]?.name}</strong>
      </div>
    </section>
  );
}
