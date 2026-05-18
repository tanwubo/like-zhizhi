import { AdminActionForm } from "@/components/admin/action-form";
import { AdminSection } from "@/components/admin/admin-section";
import { MediaGrid } from "@/components/admin/media-grid";
import { MediaUploader } from "@/components/admin/media-uploader";
import { SubmitButton } from "@/components/admin/submit-button";
import { deleteMediaAssets, registerExternalMedia, uploadMediaAsset } from "@/features/admin/media-actions";
import { getAdminMediaAssets } from "@/features/admin/media-data";

export const dynamic = "force-dynamic";

const fieldClass =
  "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

export default async function AdminMediaPage() {
  const assets = await getAdminMediaAssets();

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">媒体中心</h1>
        <p className="mt-1 text-sm text-ink/60">上传或登记图片、视频、音频和文件，供内容管理表单复用。</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <AdminSection title="上传文件" description="使用已配置的 S3 兼容对象存储。未配置对象存储时，可先使用外部媒体登记。">
          <MediaUploader uploadAction={uploadMediaAsset} />
        </AdminSection>
        <AdminSection title="登记外部媒体" description="保留外部 URL 作为本地直连环境和历史素材的逃生通道。">
          <AdminActionForm action={registerExternalMedia} className="grid gap-4" errorTitle="登记失败">
            <label className="text-sm font-medium text-ink">
              外部媒体地址
              <input className={fieldClass} name="publicUrl" placeholder="https://example.com/media.jpg" type="url" required />
            </label>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-ink">
                文件名
                <input className={fieldClass} name="filename" placeholder="留空自动识别" />
              </label>
              <label className="text-sm font-medium text-ink">
                宽度
                <input className={fieldClass} name="width" min={0} type="number" />
              </label>
              <label className="text-sm font-medium text-ink">
                高度
                <input className={fieldClass} name="height" min={0} type="number" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-ink">
                内容类型
                <input className={fieldClass} name="contentType" placeholder="image/jpeg" />
              </label>
              <label className="text-sm font-medium text-ink">
                文件大小
                <input className={fieldClass} name="sizeBytes" defaultValue={0} min={0} type="number" />
              </label>
            </div>
            <div>
              <SubmitButton>登记外部媒体</SubmitButton>
            </div>
          </AdminActionForm>
        </AdminSection>
      </div>
      <AdminSection title="媒体列表">
        <MediaGrid assets={assets} deleteAction={deleteMediaAssets} />
      </AdminSection>
    </div>
  );
}
