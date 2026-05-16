import { SubmitButton } from "@/components/admin/submit-button";

type MusicFormValue = {
  id?: string;
  title?: string;
  artist?: string;
  coverUrl?: string | null;
  sourceUrl?: string;
  sourceType?: string;
  enabled?: boolean;
  sortOrder?: number;
};

const fieldClass =
  "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

export function MusicForm({
  action,
  track
}: {
  action: (formData: FormData) => void | Promise<void>;
  track?: MusicFormValue;
}) {
  return (
    <form action={action} className="grid gap-4">
      {track?.id ? <input type="hidden" name="id" value={track.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          标题
          <input className={fieldClass} name="title" defaultValue={track?.title ?? ""} maxLength={120} required />
        </label>
        <label className="text-sm font-medium text-ink">
          歌手
          <input className={fieldClass} name="artist" defaultValue={track?.artist ?? ""} maxLength={120} required />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          封面地址
          <input className={fieldClass} name="coverUrl" defaultValue={track?.coverUrl ?? ""} type="url" />
        </label>
        <label className="text-sm font-medium text-ink">
          音频地址
          <input className={fieldClass} name="sourceUrl" defaultValue={track?.sourceUrl ?? ""} type="url" required />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_160px]">
        <label className="text-sm font-medium text-ink">
          来源类型
          <input className={fieldClass} name="sourceType" defaultValue={track?.sourceType ?? "url"} maxLength={40} />
        </label>
        <label className="text-sm font-medium text-ink">
          排序
          <input className={fieldClass} name="sortOrder" defaultValue={track?.sortOrder ?? 0} type="number" />
        </label>
        <label className="flex items-center gap-2 rounded-md border border-blush-100 bg-white px-3 py-2 text-sm font-medium text-ink">
          <input name="enabled" type="checkbox" defaultChecked={track?.enabled ?? true} />
          启用
        </label>
      </div>
      <div>
        <SubmitButton>保存音乐</SubmitButton>
      </div>
    </form>
  );
}
