import { AdminSection } from "@/components/admin/admin-section";
import { SubmitButton } from "@/components/admin/submit-button";
import { updateModuleSettings } from "@/features/admin/settings-actions";
import { getAdminSettingsData } from "@/features/admin/settings-data";

export const dynamic = "force-dynamic";

export default async function AdminModuleSettingsPage() {
  const { modules } = await getAdminSettingsData();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">模块开关</h1>
        <p className="mt-2 text-sm text-ink/60">控制公开导航和模块可见性。</p>
      </div>
      <AdminSection title="公开模块">
        <form action={updateModuleSettings} className="grid gap-3">
          {modules.map((module) => (
            <label key={module.id} className="flex items-center justify-between rounded-md bg-blush-50 px-4 py-3 text-sm text-ink">
              <span>
                <input type="hidden" name="moduleId" value={module.id} />
                <span className="font-medium">{module.label}</span>
                <span className="ml-2 text-ink/45">{module.key}</span>
              </span>
              <input name="enabled" value={module.id} type="checkbox" defaultChecked={module.enabled} />
            </label>
          ))}
          <SubmitButton>保存模块开关</SubmitButton>
        </form>
      </AdminSection>
    </div>
  );
}
