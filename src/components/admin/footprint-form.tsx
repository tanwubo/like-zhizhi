import { AdminActionForm } from "@/components/admin/action-form";
import { MediaSelector, type MediaSelectorAsset } from "@/components/admin/media-selector";
import { SubmitButton } from "@/components/admin/submit-button";

type FootprintFormValue = {
  id?: string;
  name?: string;
  description?: string;
  latitude?: { toString(): string } | string | number;
  longitude?: { toString(): string } | string | number;
  coverUrl?: string | null;
  visits?: Array<{
    id: string;
    title: string;
    description: string;
    visitedAt: Date;
  }>;
};

const fieldClass =
  "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

function dateValue(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function FootprintForm({
  action,
  place,
  mediaAssets = []
}: {
  action: (formData: FormData) => void | Promise<void>;
  place?: FootprintFormValue;
  mediaAssets?: MediaSelectorAsset[];
}) {
  const visit = place?.visits?.[0];

  return (
    <AdminActionForm action={action} className="grid gap-5">
      {place?.id ? <input type="hidden" name="id" value={place.id} /> : null}
      {visit?.id ? <input type="hidden" name="visitId" value={visit.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          地点名称
          <input className={fieldClass} name="name" defaultValue={place?.name ?? ""} maxLength={120} required />
        </label>
        <label className="text-sm font-medium text-ink">
          封面地址
          <input
            className={fieldClass}
            name="coverUrl"
            defaultValue={place?.coverUrl ?? ""}
            placeholder="https://example.com/place.jpg"
            type="url"
          />
        </label>
      </div>
      <MediaSelector assets={mediaAssets} targetName="coverUrl" />
      <label className="text-sm font-medium text-ink">
        地点说明
        <textarea
          className={fieldClass}
          name="description"
          defaultValue={place?.description ?? ""}
          rows={4}
          maxLength={1000}
          required
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          纬度
          <input
            className={fieldClass}
            name="latitude"
            defaultValue={place?.latitude?.toString() ?? ""}
            step="0.0000001"
            type="number"
            required
          />
        </label>
        <label className="text-sm font-medium text-ink">
          经度
          <input
            className={fieldClass}
            name="longitude"
            defaultValue={place?.longitude?.toString() ?? ""}
            step="0.0000001"
            type="number"
            required
          />
        </label>
      </div>
      <div className="rounded-md border border-blush-100 p-4">
        <h2 className="text-sm font-semibold text-ink">访问记录</h2>
        <p className="mt-1 text-xs text-ink/55">填写标题、说明和日期会创建或更新一条访问记录。</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-ink">
            访问标题
            <input className={fieldClass} name="visitTitle" defaultValue={visit?.title ?? ""} maxLength={120} />
          </label>
          <label className="text-sm font-medium text-ink">
            访问日期
            <input className={fieldClass} name="visitedAt" defaultValue={dateValue(visit?.visitedAt)} type="date" />
          </label>
        </div>
        <label className="mt-4 block text-sm font-medium text-ink">
          访问说明
          <textarea
            className={fieldClass}
            name="visitDescription"
            defaultValue={visit?.description ?? ""}
            rows={3}
            maxLength={1000}
          />
        </label>
      </div>
      <div>
        <SubmitButton>保存足迹</SubmitButton>
      </div>
    </AdminActionForm>
  );
}
