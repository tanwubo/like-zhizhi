import { AdminActionForm } from "@/components/admin/action-form";
import { FootprintImagePicker, type FootprintImageAsset } from "@/components/admin/footprint-image-picker";
import { SubmitButton } from "@/components/admin/submit-button";
import { formatDateInputValue } from "@/lib/date";

const fieldClass =
  "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

type FootprintMemoryValue = {
  id?: string;
  placeId: string;
  locationName?: string;
  address?: string;
  amapPoiId?: string | null;
  latitude?: { toString(): string } | string | number | null;
  longitude?: { toString(): string } | string | number | null;
  visitedAt?: Date;
  mood?: string;
  story?: string;
  sortOrder?: number | null;
  images?: Array<{ mediaAssetId: string }>;
};

export function FootprintMemoryForm({
  action,
  placeId,
  memory,
  imageAssets
}: {
  action: (formData: FormData) => void | Promise<void>;
  placeId: string;
  memory?: FootprintMemoryValue;
  imageAssets: FootprintImageAsset[];
}) {
  const selectedIds = memory?.images?.map((image) => image.mediaAssetId) ?? [];

  return (
    <AdminActionForm action={action} className="grid gap-4 rounded-md border border-blush-100 p-4">
      <input name="placeId" type="hidden" value={placeId} />
      {memory?.id ? <input name="id" type="hidden" value={memory.id} /> : null}
      <input name="amapPoiId" type="hidden" value={memory?.amapPoiId ?? ""} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          具体地点
          <input className={fieldClass} defaultValue={memory?.locationName ?? ""} name="locationName" required />
        </label>
        <label className="text-sm font-medium text-ink">
          纪念日期
          <input
            className={fieldClass}
            defaultValue={memory?.visitedAt ? formatDateInputValue(memory.visitedAt) : ""}
            name="visitedAt"
            required
            type="date"
          />
        </label>
      </div>

      <label className="text-sm font-medium text-ink">
        地址
        <input className={fieldClass} defaultValue={memory?.address ?? ""} name="address" />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium text-ink">
          纬度
          <input
            className={fieldClass}
            defaultValue={memory?.latitude?.toString() ?? ""}
            name="latitude"
            step="0.0000001"
            type="number"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          经度
          <input
            className={fieldClass}
            defaultValue={memory?.longitude?.toString() ?? ""}
            name="longitude"
            step="0.0000001"
            type="number"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          排序值
          <input className={fieldClass} defaultValue={memory?.sortOrder ?? ""} name="sortOrder" type="number" />
        </label>
      </div>

      <label className="text-sm font-medium text-ink">
        心情短句
        <input className={fieldClass} defaultValue={memory?.mood ?? ""} maxLength={80} name="mood" />
      </label>

      <label className="text-sm font-medium text-ink">
        故事
        <textarea className={fieldClass} defaultValue={memory?.story ?? ""} maxLength={2000} name="story" rows={4} />
      </label>

      <FootprintImagePicker assets={imageAssets} selectedIds={selectedIds} />

      <div>
        <SubmitButton>{memory?.id ? "保存记忆" : "添加记忆"}</SubmitButton>
      </div>
    </AdminActionForm>
  );
}
