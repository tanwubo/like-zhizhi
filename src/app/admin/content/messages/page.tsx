import { AdminActionForm } from "@/components/admin/action-form";
import { AdminSection } from "@/components/admin/admin-section";
import { SubmitButton } from "@/components/admin/submit-button";
import { approveMessage, hideMessage } from "@/features/admin/message-actions";
import { getModerationMessages } from "@/features/admin/message-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  HIDDEN: "已隐藏"
};

export default async function AdminMessagesPage() {
  const messages = await getModerationMessages();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">留言审核</h1>
        <p className="mt-2 text-sm text-ink/60">审核访客提交的公开留言，隐藏不适合展示的内容。</p>
      </div>
      <AdminSection title="最近留言">
        <div className="grid gap-4">
          {messages.map((message) => (
            <article key={message.id} className="rounded-lg border border-blush-100 bg-blush-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{message.nickname}</p>
                  <p className="mt-1 text-xs text-ink/45">
                    {statusLabels[message.status]} / {formatDateLabel(message.createdAt)}
                    {message.location ? ` / ${message.location}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <AdminActionForm action={approveMessage}>
                    <input type="hidden" name="id" value={message.id} />
                    <SubmitButton>通过</SubmitButton>
                  </AdminActionForm>
                  <AdminActionForm action={hideMessage}>
                    <input type="hidden" name="id" value={message.id} />
                    <SubmitButton>隐藏</SubmitButton>
                  </AdminActionForm>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/70">{message.content}</p>
            </article>
          ))}
          {messages.length === 0 ? <p className="text-sm text-ink/55">暂无访客留言。</p> : null}
        </div>
      </AdminSection>
    </div>
  );
}
