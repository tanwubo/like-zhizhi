import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/features/admin/dashboard-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getDashboardData();
  const totalCards = [
    ["点滴", data.totals.notes],
    ["留言", data.totals.messages],
    ["清单", data.totals.checklist],
    ["相册", data.totals.album]
  ] as const;
  const analyticsCards = [
    ["访问量", data.analytics.visits],
    ["独立访客", data.analytics.uniqueVisitors],
    ["今日留言", data.analytics.messages],
    ["今日点滴", data.analytics.notes]
  ] as const;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">管理概览</h1>
        <p className="mt-2 text-sm text-ink/60">管理公开内容、站点配置和访客互动。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {totalCards.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-ink/55">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-blush-700">{value}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {analyticsCards.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-ink/55">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-blush-700">{value}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="text-lg font-semibold text-ink">已启用模块</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.modules.map((module) => (
            <span key={module.id} className="rounded-full bg-blush-50 px-3 py-1 text-sm text-ink/70">
              {module.label}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
