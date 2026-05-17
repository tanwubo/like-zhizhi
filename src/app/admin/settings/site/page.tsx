import { AdminActionForm } from "@/components/admin/action-form";
import { AdminSection } from "@/components/admin/admin-section";
import { SubmitButton } from "@/components/admin/submit-button";
import { updateSiteSettings } from "@/features/admin/settings-actions";
import { getAdminSettingsData } from "@/features/admin/settings-data";

export const dynamic = "force-dynamic";

export default async function AdminSiteSettingsPage() {
  const { site } = await getAdminSettingsData();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">基础设置</h1>
        <p className="mt-2 text-sm text-ink/60">管理公开站点标题、文案和页脚信息。</p>
      </div>
      <AdminSection title="站点信息">
        <AdminActionForm action={updateSiteSettings} className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-ink/70">
            站点名称
            <input name="title" defaultValue={site.title} className="rounded-md border border-blush-100 px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm text-ink/70">
            首页标语
            <input name="slogan" defaultValue={site.slogan} className="rounded-md border border-blush-100 px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm text-ink/70 md:col-span-2">
            站点描述
            <textarea name="description" defaultValue={site.description} className="min-h-24 rounded-md border border-blush-100 px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm text-ink/70">
            页脚文本
            <input name="footerText" defaultValue={site.footerText} className="rounded-md border border-blush-100 px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm text-ink/70">
            SEO 关键词
            <input name="seoKeywords" defaultValue={site.seoKeywords} className="rounded-md border border-blush-100 px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm text-ink/70">
            ICP 备案
            <input name="icpText" defaultValue={site.icpText ?? ""} className="rounded-md border border-blush-100 px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm text-ink/70">
            公安备案
            <input name="policeText" defaultValue={site.policeText ?? ""} className="rounded-md border border-blush-100 px-3 py-2" />
          </label>
          <div className="md:col-span-2">
            <SubmitButton>保存基础设置</SubmitButton>
          </div>
        </AdminActionForm>
      </AdminSection>
    </div>
  );
}
