import { AdminActionForm } from "@/components/admin/action-form";
import { AdminSection } from "@/components/admin/admin-section";
import { MediaSelector } from "@/components/admin/media-selector";
import { SubmitButton } from "@/components/admin/submit-button";
import { getFontOptionGroups } from "@/features/admin/font-options";
import { getAdminMediaAssets } from "@/features/admin/media-data";
import { updateThemeSettings } from "@/features/admin/settings-actions";
import { getAdminSettingsData } from "@/features/admin/settings-data";

export const dynamic = "force-dynamic";

export default async function AdminThemeSettingsPage() {
  const [{ theme }, mediaAssets] = await Promise.all([getAdminSettingsData(), getAdminMediaAssets()]);
  const fontOptionGroups = getFontOptionGroups();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">主题设置</h1>
        <p className="mt-2 text-sm text-ink/60">管理公开站点的主色、背景媒体和视觉效果。</p>
      </div>
      <AdminSection title="公开主题">
        <AdminActionForm action={updateThemeSettings} className="grid gap-4 md:grid-cols-2">
          <input name="bodyFontKey" type="hidden" value={theme.bodyFontKey ?? ""} />
          <input name="displayFontKey" type="hidden" value={theme.displayFontKey ?? ""} />
          <input name="romanceFontKey" type="hidden" value={theme.romanceFontKey ?? ""} />
          <input name="numberFontKey" type="hidden" value={theme.numberFontKey ?? ""} />
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
        </AdminActionForm>
      </AdminSection>
      <AdminSection title="字体设置">
        <AdminActionForm action={updateThemeSettings} className="grid gap-4 md:grid-cols-2">
          <input name="primaryColor" type="hidden" value={theme.primaryColor} />
          <input name="backgroundImageUrl" type="hidden" value={theme.backgroundImageUrl ?? ""} />
          <input name="backgroundVideoUrl" type="hidden" value={theme.backgroundVideoUrl ?? ""} />
          {theme.enableGlassEffect ? <input name="enableGlassEffect" type="hidden" value="on" /> : null}
          {theme.enablePageAnimation ? <input name="enablePageAnimation" type="hidden" value="on" /> : null}
          <FontSelect
            label="正文"
            name="bodyFontKey"
            options={fontOptionGroups.body}
            value={theme.bodyFontKey}
            helper="公开页面的大段正文，优先保持清爽稳定。"
          />
          <FontSelect
            label="标题 / 卡片标题"
            name="displayFontKey"
            options={fontOptionGroups.display}
            value={theme.displayFontKey}
            helper="用于首页卡片标题、模块标题等重点文字。"
          />
          <FontSelect
            label="情绪文案"
            name="romanceFontKey"
            options={fontOptionGroups.romance}
            value={theme.romanceFontKey}
            helper="用于纪念日诗句、底部大语录等少量氛围文案。"
          />
          <FontSelect
            label="数字"
            name="numberFontKey"
            options={fontOptionGroups.number}
            value={theme.numberFontKey}
            helper="用于天数、时间、日期等计数器数字。"
          />
          <div className="md:col-span-2">
            <SubmitButton>保存字体设置</SubmitButton>
          </div>
        </AdminActionForm>
      </AdminSection>
    </div>
  );
}

function FontSelect({
  helper,
  label,
  name,
  options,
  value
}: {
  helper: string;
  label: string;
  name: string;
  options: { key: string; label: string }[];
  value?: string | null;
}) {
  return (
    <label className="grid gap-2 text-sm text-ink/70">
      {label}
      <select
        name={name}
        defaultValue={value ?? options[0]?.key}
        className="rounded-md border border-blush-100 bg-white px-3 py-2 text-ink"
      >
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="text-xs text-ink/45">{helper}</span>
    </label>
  );
}
