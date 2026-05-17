import { PublishStatus } from "@prisma/client";

import { AdminActionForm } from "@/components/admin/action-form";
import { MediaSelector, type MediaSelectorAsset } from "@/components/admin/media-selector";
import { SubmitButton } from "@/components/admin/submit-button";

type NoteFormValue = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  status?: PublishStatus;
  mood?: string | null;
  weather?: string | null;
  location?: string | null;
};

const fieldClass =
  "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

export function NoteForm({
  action,
  note,
  mediaAssets = []
}: {
  action: (formData: FormData) => void | Promise<void>;
  note?: NoteFormValue;
  mediaAssets?: MediaSelectorAsset[];
}) {
  return (
    <AdminActionForm action={action} className="grid gap-4">
      {note?.id ? <input type="hidden" name="id" value={note.id} /> : null}
      <label className="text-sm font-medium text-ink">
        标题
        <input className={fieldClass} name="title" defaultValue={note?.title ?? ""} maxLength={120} required />
      </label>
      <label className="text-sm font-medium text-ink">
        链接标识
        <input
          className={fieldClass}
          name="slug"
          defaultValue={note?.slug ?? ""}
          placeholder="留空则根据标题自动生成"
          maxLength={140}
        />
      </label>
      <label className="text-sm font-medium text-ink">
        摘要
        <textarea
          className={fieldClass}
          name="excerpt"
          defaultValue={note?.excerpt ?? ""}
          rows={3}
          maxLength={300}
          required
        />
      </label>
      <label className="text-sm font-medium text-ink">
        正文
        <textarea className={fieldClass} name="content" defaultValue={note?.content ?? ""} rows={10} required />
      </label>
      <MediaSelector assets={mediaAssets} targetName="content" label="从媒体中心插入到正文" mode="appendMarkdown" />
      <div className="grid gap-4 md:grid-cols-4">
        <label className="text-sm font-medium text-ink">
          状态
          <select className={fieldClass} name="status" defaultValue={note?.status ?? PublishStatus.DRAFT}>
            <option value={PublishStatus.DRAFT}>草稿</option>
            <option value={PublishStatus.PUBLISHED}>发布</option>
            <option value={PublishStatus.HIDDEN}>隐藏</option>
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          心情
          <input className={fieldClass} name="mood" defaultValue={note?.mood ?? ""} />
        </label>
        <label className="text-sm font-medium text-ink">
          天气
          <input className={fieldClass} name="weather" defaultValue={note?.weather ?? ""} />
        </label>
        <label className="text-sm font-medium text-ink">
          位置
          <input className={fieldClass} name="location" defaultValue={note?.location ?? ""} />
        </label>
      </div>
      <div>
        <SubmitButton>保存点滴</SubmitButton>
      </div>
    </AdminActionForm>
  );
}
