import { PublicShell } from "@/components/layout/public-shell";
import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
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
    >
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl font-semibold text-ink">清单</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {items.length ? (
            items.map((item) => (
              <ContentCard key={item.id} title={item.title} meta={item.completed ? "已完成" : "进行中"}>
                {item.description}
              </ContentCard>
            ))
          ) : (
            <EmptyState title="暂无清单" description="愿望和计划会展示在这里。" />
          )}
        </div>
      </section>
    </PublicShell>
  );
}
