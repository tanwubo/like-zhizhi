import { PublicShell } from "@/components/layout/public-shell";
import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { MessageForm } from "@/components/public/message-form";
import { getApprovedMessages } from "@/features/public/public-content";
import { getPublicSiteData } from "@/features/public/site-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const [publicData, messages] = await Promise.all([getPublicSiteData(), getApprovedMessages()]);

  return (
    <PublicShell
      title={publicData.site.title}
      footerText={publicData.site.footerText}
      modules={publicData.navigation}
    >
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl font-semibold text-ink">留言</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <MessageForm />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
            {messages.length ? (
              messages.map((message) => (
                <ContentCard
                  key={message.id}
                  title={message.nickname}
                  meta={formatDateLabel(message.createdAt)}
                >
                  {message.content}
                </ContentCard>
              ))
            ) : (
              <EmptyState title="暂无留言" description="通过审核后的祝福会展示在这里。" />
            )}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
