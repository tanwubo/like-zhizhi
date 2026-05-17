import type { CarouselSlide } from "@prisma/client";

import { AdminActionForm } from "@/components/admin/action-form";
import { MediaSelector, type MediaSelectorAsset } from "@/components/admin/media-selector";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

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
        <Label className="grid gap-2">
          标题
          <Input name="title" defaultValue={slide?.title ?? ""} maxLength={80} required />
        </Label>
        <Label className="grid gap-2">
          排序
          <Input name="sortOrder" defaultValue={slide?.sortOrder ?? 0} type="number" />
        </Label>
      </div>
      <Label className="grid gap-2">
        图片地址
        <Input
          name="imageUrl"
          defaultValue={slide?.imageUrl ?? ""}
          placeholder="https://example.com/slide.jpg"
          type="url"
          required
        />
      </Label>
      <MediaSelector assets={mediaAssets} targetName="imageUrl" label="从媒体中心选择轮播图" />
      <Label className="grid gap-2">
        跳转地址
        <Input
          name="linkUrl"
          defaultValue={slide?.linkUrl ?? ""}
          placeholder="https://example.com 或留空"
          type="url"
        />
      </Label>
      <Label className="grid gap-2">
        描述
        <Textarea name="description" defaultValue={slide?.description ?? ""} rows={4} maxLength={200} />
      </Label>
      <Label className="flex items-center justify-between rounded-md bg-blush-50 px-4 py-3 text-sm text-ink">
        <span>
          <span className="font-medium">启用</span>
          <span className="ml-2 text-ink/45">启用后会在首页头部轮播中展示</span>
        </span>
        <Switch name="enabled" defaultChecked={slide?.enabled ?? true} />
      </Label>
      <div>
        <SubmitButton>保存轮播图</SubmitButton>
      </div>
    </AdminActionForm>
  );
}
