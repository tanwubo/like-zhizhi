import { MediaType, PublishStatus } from "@prisma/client";

import { AdminActionForm } from "@/components/admin/action-form";
import { MediaSelector, type MediaSelectorAsset } from "@/components/admin/media-selector";
import { SubmitButton } from "@/components/admin/submit-button";

type AlbumFormValue = {
  id?: string;
  mediaId?: string;
  title?: string;
  caption?: string;
  status?: PublishStatus;
  takenAt?: Date | null;
  location?: string | null;
  authorLabel?: string | null;
  sortOrder?: number;
  media?: {
    type?: MediaType;
    publicUrl?: string;
    filename?: string;
    contentType?: string;
    sizeBytes?: number;
    width?: number | null;
    height?: number | null;
  };
};

const fieldClass =
  "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

function dateValue(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function AlbumForm({
  action,
  item,
  mediaAssets = []
}: {
  action: (formData: FormData) => void | Promise<void>;
  item?: AlbumFormValue;
  mediaAssets?: MediaSelectorAsset[];
}) {
  return (
    <AdminActionForm action={action} className="grid gap-4">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}
      {item?.mediaId ? <input type="hidden" name="mediaId" value={item.mediaId} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          标题
          <input className={fieldClass} name="title" defaultValue={item?.title ?? ""} maxLength={120} required />
        </label>
        <label className="text-sm font-medium text-ink">
          媒体地址
          <input
            className={fieldClass}
            name="publicUrl"
            defaultValue={item?.media?.publicUrl ?? ""}
            placeholder="https://example.com/photo.jpg"
            type="url"
            required
          />
        </label>
      </div>
      <MediaSelector assets={mediaAssets} targetName="publicUrl" />
      <label className="text-sm font-medium text-ink">
        说明
        <textarea className={fieldClass} name="caption" defaultValue={item?.caption ?? ""} rows={4} maxLength={500} />
      </label>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="text-sm font-medium text-ink">
          媒体类型
          <select className={fieldClass} name="mediaType" defaultValue={item?.media?.type ?? MediaType.IMAGE}>
            <option value={MediaType.IMAGE}>图片</option>
            <option value={MediaType.VIDEO}>视频</option>
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          状态
          <select className={fieldClass} name="status" defaultValue={item?.status ?? PublishStatus.DRAFT}>
            <option value={PublishStatus.DRAFT}>草稿</option>
            <option value={PublishStatus.PUBLISHED}>发布</option>
            <option value={PublishStatus.HIDDEN}>隐藏</option>
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          拍摄日期
          <input className={fieldClass} name="takenAt" defaultValue={dateValue(item?.takenAt)} type="date" />
        </label>
        <label className="text-sm font-medium text-ink">
          排序
          <input className={fieldClass} name="sortOrder" defaultValue={item?.sortOrder ?? 0} type="number" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="text-sm font-medium text-ink">
          位置
          <input className={fieldClass} name="location" defaultValue={item?.location ?? ""} />
        </label>
        <label className="text-sm font-medium text-ink">
          作者
          <input className={fieldClass} name="authorLabel" defaultValue={item?.authorLabel ?? ""} />
        </label>
        <label className="text-sm font-medium text-ink">
          宽度
          <input className={fieldClass} name="width" defaultValue={item?.media?.width ?? ""} type="number" min={0} />
        </label>
        <label className="text-sm font-medium text-ink">
          高度
          <input className={fieldClass} name="height" defaultValue={item?.media?.height ?? ""} type="number" min={0} />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium text-ink">
          文件名
          <input className={fieldClass} name="filename" defaultValue={item?.media?.filename ?? ""} />
        </label>
        <label className="text-sm font-medium text-ink">
          内容类型
          <input className={fieldClass} name="contentType" defaultValue={item?.media?.contentType ?? ""} />
        </label>
        <label className="text-sm font-medium text-ink">
          文件大小
          <input
            className={fieldClass}
            name="sizeBytes"
            defaultValue={item?.media?.sizeBytes ?? 0}
            type="number"
            min={0}
          />
        </label>
      </div>
      <div>
        <SubmitButton>保存相册</SubmitButton>
      </div>
    </AdminActionForm>
  );
}
