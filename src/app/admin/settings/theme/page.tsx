import { AdminSection } from "@/components/admin/admin-section";
import { MediaSelector } from "@/components/admin/media-selector";
import { SubmitButton } from "@/components/admin/submit-button";
import { getAdminMediaAssets } from "@/features/admin/media-data";
import { updateThemeSettings } from "@/features/admin/settings-actions";
import { getAdminSettingsData } from "@/features/admin/settings-data";

export const dynamic = "force-dynamic";

export default async function AdminThemeSettingsPage() {
  const [{ theme }, mediaAssets] = await Promise.all([getAdminSettingsData(), getAdminMediaAssets()]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">主题设置</h1>
        <p className="mt-2 text-sm text-ink/60">管理公开站点的主色、背景媒体和视觉效果。</p>
      </div>
      <AdminSection title="公开主题">
        <form action={updateThemeSettings} className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-ink/70">
            主色
            <input
              name="primaryColor"
              defaultValue={theme.primaryColor}
              pattern="#[0-9a-fA-F]{6}"
              className="rounded-md border border-blush-100 px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm text-ink/70">
            背景图片地址
            <input
              name="backgroundImageUrl"
              defaultValue={theme.backgroundImageUrl ?? ""}
              placeholder="https://example.com/background.jpg"
              className="rounded-md border border-blush-100 px-3 py-2"
            />
          </label>
          <div className="md:col-span-2">
            <MediaSelector assets={mediaAssets} targetName="backgroundImageUrl" />
          </div>
          <label className="grid gap-2 text-sm text-ink/70 md:col-span-2">
            背景视频地址
            <input
              name="backgroundVideoUrl"
              defaultValue={theme.backgroundVideoUrl ?? ""}
              placeholder="https://example.com/background.mp4"
              className="rounded-md border border-blush-100 px-3 py-2"
            />
          </label>
          <div className="md:col-span-2">
            <MediaSelector assets={mediaAssets} targetName="backgroundVideoUrl" />
          </div>
          <label className="flex items-center justify-between rounded-md bg-blush-50 px-4 py-3 text-sm text-ink">
            <span>
              <span className="font-medium">玻璃效果</span>
              <span className="ml-2 text-ink/45">导航和页脚半透明模糊</span>
            </span>
            <input name="enableGlassEffect" type="checkbox" defaultChecked={theme.enableGlassEffect} />
          </label>
          <label className="flex items-center justify-between rounded-md bg-blush-50 px-4 py-3 text-sm text-ink">
            <span>
              <span className="font-medium">页面动效</span>
              <span className="ml-2 text-ink/45">公开页面进入时轻微淡入</span>
            </span>
            <input name="enablePageAnimation" type="checkbox" defaultChecked={theme.enablePageAnimation} />
          </label>
          <div className="md:col-span-2">
            <SubmitButton>保存主题设置</SubmitButton>
          </div>
        </form>
      </AdminSection>
    </div>
  );
}
