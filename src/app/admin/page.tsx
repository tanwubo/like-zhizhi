import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/features/admin/dashboard-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getDashboardData();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">管理概览</h1>
        <p className="mt-2 text-sm text-ink/60">管理公开内容、站点配置和访客互动。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(data.totals).map(([key, value]) => (
          <Card key={key}>
            <p className="text-sm text-ink/55">{key}</p>
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
