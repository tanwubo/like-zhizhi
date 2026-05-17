import { PublicShell } from "@/components/layout/public-shell";
import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { MessageForm } from "@/components/public/message-form";
import { PageHeader } from "@/components/public/page-header";
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
      theme={publicData.theme}
      variant="home"
    >
      <div className="min-h-[calc(100vh-60px)] bg-[#f5f5f7] text-[#1d1d1f]">
        <PageHeader eyebrow="Guestbook" title="留言" description="把想说的话留在这里，等它变成新的纪念。" />
        <section className="mx-auto grid max-w-[1200px] gap-5 px-4 pb-12 lg:grid-cols-[0.82fr_1.18fr] md:px-6">
          <MessageForm />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {messages.length ? (
              messages.map((message) => (
                <ContentCard key={message.id} title={message.nickname} meta={formatDateLabel(message.createdAt)}>
                  {message.content}
                </ContentCard>
              ))
            ) : (
              <EmptyState title="暂无留言" description="通过审核后的祝福会展示在这里。" />
            )}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
