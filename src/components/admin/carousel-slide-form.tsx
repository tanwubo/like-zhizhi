import type { CarouselSlide } from "@prisma/client";

import { AdminActionForm } from "@/components/admin/action-form";
import { MediaSelector, type MediaSelectorAsset } from "@/components/admin/media-selector";
import { SubmitButton } from "@/components/admin/submit-button";

const fieldClass =
  "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

type CarouselSlideFormValue = Pick<
  CarouselSlide,
  "id" | "title" | "imageUrl" | "linkUrl" | "description" | "enabled" | "sortOrder"
>;

export function CarouselSlideForm({
  action,
  slide,
  mediaAssets = []
}: {
  action: (formData: FormData) => void | Promise<void>;
  slide?: CarouselSlideFormValue;
  mediaAssets?: MediaSelectorAsset[];
}) {
  return (
    <AdminActionForm action={action} className="grid gap-4">
      {slide?.id ? <input type="hidden" name="id" value={slide.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          标题
          <input className={fieldClass} name="title" defaultValue={slide?.title ?? ""} maxLength={80} required />
        </label>
        <label className="text-sm font-medium text-ink">
          排序
          <input className={fieldClass} name="sortOrder" defaultValue={slide?.sortOrder ?? 0} type="number" />
        </label>
      </div>
      <label className="text-sm font-medium text-ink">
        图片地址
        <input
          className={fieldClass}
          name="imageUrl"
          defaultValue={slide?.imageUrl ?? ""}
          placeholder="https://example.com/slide.jpg"
          type="url"
          required
        />
      </label>
      <MediaSelector assets={mediaAssets} targetName="imageUrl" label="从媒体中心选择轮播图" />
      <label className="text-sm font-medium text-ink">
        跳转地址
        <input
          className={fieldClass}
          name="linkUrl"
          defaultValue={slide?.linkUrl ?? ""}
          placeholder="https://example.com 或留空"
          type="url"
        />
      </label>
      <label className="text-sm font-medium text-ink">
        描述
        <textarea className={fieldClass} name="description" defaultValue={slide?.description ?? ""} rows={4} maxLength={200} />
      </label>
      <label className="flex items-center justify-between rounded-md bg-blush-50 px-4 py-3 text-sm text-ink">
        <span>
          <span className="font-medium">启用</span>
          <span className="ml-2 text-ink/45">启用后会在首页头部轮播中展示</span>
        </span>
        <input name="enabled" type="checkbox" defaultChecked={slide?.enabled ?? true} />
      </label>
      <div>
        <SubmitButton>保存轮播图</SubmitButton>
      </div>
    </AdminActionForm>
  );
}
