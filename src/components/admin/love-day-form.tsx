import { AdminActionForm } from "@/components/admin/action-form";
import { SubmitButton } from "@/components/admin/submit-button";

type LoveDayFormValue = {
  id?: string;
  title?: string;
  description?: string;
  date?: Date;
  yearly?: boolean;
  lunar?: boolean;
  sortOrder?: number;
};

const fieldClass =
  "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

function dateValue(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function LoveDayForm({
  action,
  event
}: {
  action: (formData: FormData) => void | Promise<void>;
  event?: LoveDayFormValue;
}) {
  return (
    <AdminActionForm action={action} className="grid gap-4">
      {event?.id ? <input type="hidden" name="id" value={event.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          标题
          <input className={fieldClass} name="title" defaultValue={event?.title ?? ""} maxLength={120} required />
        </label>
        <label className="text-sm font-medium text-ink">
          日期
          <input className={fieldClass} name="date" defaultValue={dateValue(event?.date)} type="date" required />
        </label>
      </div>
      <label className="text-sm font-medium text-ink">
        说明
        <textarea
          className={fieldClass}
          name="description"
          defaultValue={event?.description ?? ""}
          rows={5}
          maxLength={1000}
          required
        />
      </label>
      <div className="grid gap-4 md:grid-cols-[1fr_160px_160px]">
        <label className="text-sm font-medium text-ink">
          排序
          <input className={fieldClass} name="sortOrder" defaultValue={event?.sortOrder ?? 0} type="number" />
        </label>
        <label className="flex items-center gap-2 rounded-md border border-blush-100 bg-white px-3 py-2 text-sm font-medium text-ink">
          <input name="yearly" type="checkbox" defaultChecked={event?.yearly ?? false} />
          每年重复
        </label>
        <label className="flex items-center gap-2 rounded-md border border-blush-100 bg-white px-3 py-2 text-sm font-medium text-ink">
          <input name="lunar" type="checkbox" defaultChecked={event?.lunar ?? false} />
          农历
        </label>
      </div>
      <div>
        <SubmitButton>保存纪念日</SubmitButton>
      </div>
    </AdminActionForm>
  );
}
