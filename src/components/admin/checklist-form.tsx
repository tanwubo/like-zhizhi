import { PublishStatus } from "@/server/db/enums";

import { AdminActionForm } from "@/components/admin/action-form";
import { MediaSelector, type MediaSelectorAsset } from "@/components/admin/media-selector";
import { SubmitButton } from "@/components/admin/submit-button";

type ChecklistFormValue = {
  id?: string;
  title?: string;
  description?: string;
  status?: PublishStatus;
  completed?: boolean;
  completedAt?: Date | null;
  targetDate?: Date | null;
  location?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
};

const fieldClass =
  "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

function dateValue(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function ChecklistForm({
  action,
  item,
  mediaAssets = []
}: {
  action: (formData: FormData) => void | Promise<void>;
  item?: ChecklistFormValue;
  mediaAssets?: MediaSelectorAsset[];
}) {
  return (
    <AdminActionForm action={action} className="grid gap-4">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          标题
          <input className={fieldClass} name="title" defaultValue={item?.title ?? ""} maxLength={120} required />
        </label>
        <label className="text-sm font-medium text-ink">
          图片地址
          <input
            className={fieldClass}
            name="imageUrl"
            defaultValue={item?.imageUrl ?? ""}
            placeholder="https://example.com/checklist.jpg"
            type="url"
          />
        </label>
      </div>
      <MediaSelector assets={mediaAssets} targetName="imageUrl" />
      <label className="text-sm font-medium text-ink">
        说明
        <textarea
          className={fieldClass}
          name="description"
          defaultValue={item?.description ?? ""}
          rows={5}
          maxLength={1000}
        />
      </label>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="text-sm font-medium text-ink">
          状态
          <select className={fieldClass} name="status" defaultValue={item?.status ?? PublishStatus.DRAFT}>
            <option value={PublishStatus.DRAFT}>草稿</option>
            <option value={PublishStatus.PUBLISHED}>发布</option>
            <option value={PublishStatus.HIDDEN}>隐藏</option>
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          目标日期
          <input className={fieldClass} name="targetDate" defaultValue={dateValue(item?.targetDate)} type="date" />
        </label>
        <label className="text-sm font-medium text-ink">
          完成日期
          <input className={fieldClass} name="completedAt" defaultValue={dateValue(item?.completedAt)} type="date" />
        </label>
        <label className="text-sm font-medium text-ink">
          排序
          <input className={fieldClass} name="sortOrder" defaultValue={item?.sortOrder ?? 0} type="number" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <label className="text-sm font-medium text-ink">
          位置
          <input className={fieldClass} name="location" defaultValue={item?.location ?? ""} />
        </label>
        <label className="flex items-center gap-2 rounded-md border border-blush-100 bg-white px-3 py-2 text-sm font-medium text-ink">
          <input name="completed" type="checkbox" defaultChecked={item?.completed ?? false} />
          已完成
        </label>
      </div>
      <div>
        <SubmitButton>保存清单</SubmitButton>
      </div>
    </AdminActionForm>
  );
}
