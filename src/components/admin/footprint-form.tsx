"use client";

import { useCallback, useState } from "react";

import { AdminActionForm } from "@/components/admin/action-form";
import { FootprintLocationSearch } from "@/components/admin/footprint-location-search";
import { SubmitButton } from "@/components/admin/submit-button";

const fieldClass =
  "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

type FootprintPlaceValue = {
  id?: string;
  name?: string;
  description?: string | null;
  latitude?: { toString(): string } | string | number;
  longitude?: { toString(): string } | string | number;
  amapAdcode?: string | null;
  amapCityCode?: string | null;
  coverUrl?: string | null;
  sortOrder?: number;
  enabled?: boolean;
};

type LocationState = {
  name: string;
  latitude: string;
  longitude: string;
  amapAdcode: string;
  amapCityCode: string;
};

export function FootprintForm({
  action,
  place
}: {
  action: (formData: FormData) => void | Promise<void>;
  place?: FootprintPlaceValue;
}) {
  const [values, setValues] = useState<LocationState>({
    name: place?.name ?? "",
    latitude: place?.latitude?.toString() ?? "",
    longitude: place?.longitude?.toString() ?? "",
    amapAdcode: place?.amapAdcode ?? "",
    amapCityCode: place?.amapCityCode ?? ""
  });

  const applyLocation = useCallback((payload: Partial<LocationState>) => {
    setValues((current) => {
      const next = { ...current };

      for (const [key, value] of Object.entries(payload)) {
        if (value) {
          next[key as keyof LocationState] = value;
        }
      }

      return next;
    });
  }, []);

  return (
    <AdminActionForm action={action} className="grid gap-5">
      {place?.id ? <input name="id" type="hidden" value={place.id} /> : null}
      <FootprintLocationSearch onApply={applyLocation} />
      <input name="amapAdcode" type="hidden" value={values.amapAdcode} />
      <input name="amapCityCode" type="hidden" value={values.amapCityCode} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          城市地点
          <input
            className={fieldClass}
            maxLength={120}
            name="name"
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            required
            value={values.name}
          />
        </label>
        <label className="text-sm font-medium text-ink">
          排序值
          <input className={fieldClass} defaultValue={place?.sortOrder ?? 0} name="sortOrder" required type="number" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          纬度
          <input
            className={fieldClass}
            name="latitude"
            onChange={(event) => setValues((current) => ({ ...current, latitude: event.target.value }))}
            required
            step="0.0000001"
            type="number"
            value={values.latitude}
          />
        </label>
        <label className="text-sm font-medium text-ink">
          经度
          <input
            className={fieldClass}
            name="longitude"
            onChange={(event) => setValues((current) => ({ ...current, longitude: event.target.value }))}
            required
            step="0.0000001"
            type="number"
            value={values.longitude}
          />
        </label>
      </div>

      <label className="text-sm font-medium text-ink">
        封面地址
        <input
          className={fieldClass}
          defaultValue={place?.coverUrl ?? ""}
          name="coverUrl"
          placeholder="https://example.com/place.jpg"
          type="url"
        />
      </label>

      <label className="text-sm font-medium text-ink">
        城市说明
        <textarea
          className={fieldClass}
          defaultValue={place?.description ?? ""}
          maxLength={1000}
          name="description"
          rows={4}
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input defaultChecked={place?.enabled ?? true} name="enabled" type="checkbox" />
        公开展示
      </label>

      <div>
        <SubmitButton>保存城市</SubmitButton>
      </div>
    </AdminActionForm>
  );
}
