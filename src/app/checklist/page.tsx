import { PublicShell } from "@/components/layout/public-shell";
import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { PageHeader } from "@/components/public/page-header";
import { getChecklistItems } from "@/features/public/public-content";
import { getPublicSiteData } from "@/features/public/site-data";

export const dynamic = "force-dynamic";

export default async function ChecklistPage() {
  const [publicData, items] = await Promise.all([getPublicSiteData(), getChecklistItems()]);

  return (
    <PublicShell
      title={publicData.site.title}
      footerText={publicData.site.footerText}
      modules={publicData.navigation}
      theme={publicData.theme}
      variant="home"
    >
      <div className="min-h-[calc(100vh-60px)] bg-[#f5f5f7] text-[#1d1d1f]">
        <PageHeader eyebrow="Wish List" title="清单" description="把想一起完成的事写下来，一件一件兑现。" />
        <section className="mx-auto grid max-w-[1200px] gap-4 px-4 pb-12 md:grid-cols-2 md:px-6">
          {items.length ? (
            items.map((item) => (
              <ContentCard key={item.id} title={item.title} meta={item.completed ? "已完成" : "进行中"}>
                {item.description}
              </ContentCard>
            ))
          ) : (
            <div className="md:col-span-2">
              <EmptyState title="暂无清单" description="愿望和计划会展示在这里。" />
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
