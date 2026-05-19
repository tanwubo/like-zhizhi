"use client";

import { useEffect, useId, useState } from "react";

import { loadAMap } from "@/lib/amap-loader";

type LocationPayload = {
  name?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  amapAdcode?: string;
  amapCityCode?: string;
  amapPoiId?: string;
};

type AMapPoi = {
  id?: string;
  name?: string;
  address?: string;
  adcode?: string;
  citycode?: string;
  location?: {
    lng?: number;
    lat?: number;
  };
};

type AMapSearchNamespace = {
  AutoComplete: new (options: { input: string }) => {
    on: (event: "select", handler: (event: { poi?: AMapPoi }) => void) => void;
  };
  PlaceSearch: new (options: { pageSize: number; pageIndex: number; extensions: string }) => {
    search: (
      keyword: string,
      callback: (status: string, result?: { poiList?: { pois?: AMapPoi[] } }) => void
    ) => void;
  };
};

export function FootprintLocationSearch({ onApply }: { onApply: (payload: LocationPayload) => void }) {
  const inputId = useId().replace(/:/g, "-");
  const [status, setStatus] = useState("正在尝试加载高德搜索，也可以直接手动填写。");

  useEffect(() => {
    let disposed = false;

    loadAMap({
      key: process.env.NEXT_PUBLIC_AMAP_JSAPI_KEY,
      securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE,
      serviceHost: process.env.NEXT_PUBLIC_AMAP_SERVICE_HOST,
      plugins: ["AMap.AutoComplete", "AMap.PlaceSearch"]
    }).then((result) => {
      if (disposed) {
        return;
      }

      if (!result.ok) {
        setStatus("未配置高德地图，继续手动填写坐标。");
        return;
      }

      const AMap = result.AMap as AMapSearchNamespace;
      const autoComplete = new AMap.AutoComplete({ input: inputId });
      const placeSearch = new AMap.PlaceSearch({ pageSize: 5, pageIndex: 1, extensions: "all" });

      autoComplete.on("select", (event) => {
        const keyword = event.poi?.name;
        if (!keyword) {
          return;
        }

        placeSearch.search(keyword, (_searchStatus, searchResult) => {
          const poi = searchResult?.poiList?.pois?.[0] ?? event.poi;
          const location = poi?.location;
          onApply({
            name: poi?.name,
            address: poi?.address,
            longitude: location?.lng == null ? undefined : String(location.lng),
            latitude: location?.lat == null ? undefined : String(location.lat),
            amapAdcode: poi?.adcode,
            amapCityCode: poi?.citycode,
            amapPoiId: poi?.id
          });
        });
      });

      setStatus("输入城市或地点后选择候选项，会自动带出坐标。");
    });

    return () => {
      disposed = true;
    };
  }, [inputId, onApply]);

  return (
    <label className="text-sm font-medium text-ink">
      高德地点搜索
      <input
        className="mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300"
        id={inputId}
        placeholder="输入城市、景点或具体地点"
      />
      <span className="mt-1 block text-xs text-ink/50">{status}</span>
    </label>
  );
}
