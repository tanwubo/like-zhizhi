import { AdminSection } from "@/components/admin/admin-section";
import { MediaSelector } from "@/components/admin/media-selector";
import { SubmitButton } from "@/components/admin/submit-button";
import { getAdminMediaAssets } from "@/features/admin/media-data";
import { updatePersonProfile } from "@/features/admin/settings-actions";
import { getAdminSettingsData } from "@/features/admin/settings-data";

export const dynamic = "force-dynamic";

export default async function AdminPeopleSettingsPage() {
  const [{ people }, mediaAssets] = await Promise.all([getAdminSettingsData(), getAdminMediaAssets()]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">人物资料</h1>
        <p className="mt-2 text-sm text-ink/60">维护公开首页和关于页面展示的人物信息。</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {people.map((person) => (
          <AdminSection key={person.id} title={`人物 ${person.slot}`}>
            <form action={updatePersonProfile} className="grid gap-4">
              <input type="hidden" name="id" value={person.id} />
              <label className="grid gap-2 text-sm text-ink/70">
                昵称
                <input name="displayName" defaultValue={person.displayName} className="rounded-md border border-blush-100 px-3 py-2" />
              </label>
              <label className="grid gap-2 text-sm text-ink/70">
                所在地
                <input name="location" defaultValue={person.location ?? ""} className="rounded-md border border-blush-100 px-3 py-2" />
              </label>
              <label className="grid gap-2 text-sm text-ink/70">
                头像地址
                <input
                  id={`avatarUrl-${person.id}`}
                  name="avatarUrl"
                  defaultValue={person.avatarUrl ?? ""}
                  placeholder="https://example.com/avatar.jpg"
                  className="rounded-md border border-blush-100 px-3 py-2"
                  type="url"
                />
              </label>
              <MediaSelector
                assets={mediaAssets}
                targetId={`avatarUrl-${person.id}`}
                targetName="avatarUrl"
                label="从媒体中心选择头像"
              />
              <label className="grid gap-2 text-sm text-ink/70">
                简介
                <textarea name="bio" defaultValue={person.bio} className="min-h-24 rounded-md border border-blush-100 px-3 py-2" />
              </label>
              <SubmitButton>保存人物资料</SubmitButton>
            </form>
          </AdminSection>
        ))}
      </div>
    </div>
  );
}
