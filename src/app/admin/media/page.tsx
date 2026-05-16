import { MediaType } from "@prisma/client";

import { AdminSection } from "@/components/admin/admin-section";
import { SubmitButton } from "@/components/admin/submit-button";
import { registerExternalMedia, uploadMediaAsset } from "@/features/admin/media-actions";
import { getAdminMediaAssets } from "@/features/admin/media-data";
import { formatDateLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

const mediaTypeLabels: Record<MediaType, string> = {
  IMAGE: "图片",
  VIDEO: "视频",
  AUDIO: "音频",
  FILE: "文件"
};

const fieldClass =
  "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

function formatSize(sizeBytes: number) {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
  }
  if (sizeBytes >= 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${sizeBytes} B`;
}

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
          <form action={uploadMediaAsset} className="grid gap-4">
            <label className="text-sm font-medium text-ink">
              本地文件
              <input className={fieldClass} name="file" type="file" />
            </label>
            <div>
              <SubmitButton>上传媒体</SubmitButton>
            </div>
          </form>
        </AdminSection>
        <AdminSection title="登记外部媒体" description="保留外部 URL 作为本地直连环境和历史素材的逃生通道。">
          <form action={registerExternalMedia} className="grid gap-4">
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
          </form>
        </AdminSection>
      </div>
      <AdminSection title="媒体列表">
        {assets.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-ink/50">
                <tr className="border-b border-blush-100">
                  <th className="py-2 pr-4 font-medium">文件</th>
                  <th className="py-2 pr-4 font-medium">类型</th>
                  <th className="py-2 pr-4 font-medium">尺寸</th>
                  <th className="py-2 pr-4 font-medium">大小</th>
                  <th className="py-2 pr-4 font-medium">来源</th>
                  <th className="py-2 pr-4 font-medium">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="border-b border-blush-50 align-top">
                    <td className="py-3 pr-4">
                      <a className="font-medium text-blush-700" href={asset.publicUrl} rel="noreferrer" target="_blank">
                        {asset.filename}
                      </a>
                      <p className="mt-1 max-w-[360px] truncate text-xs text-ink/45">{asset.publicUrl}</p>
                    </td>
                    <td className="py-3 pr-4 text-ink/70">
                      {mediaTypeLabels[asset.type]}
                      <p className="mt-1 text-xs text-ink/45">{asset.contentType}</p>
                    </td>
                    <td className="py-3 pr-4 text-ink/60">
                      {asset.width && asset.height ? `${asset.width} x ${asset.height}` : "-"}
                    </td>
                    <td className="py-3 pr-4 text-ink/60">{formatSize(asset.sizeBytes)}</td>
                    <td className="py-3 pr-4 text-ink/60">{asset.bucket}</td>
                    <td className="py-3 pr-4 text-ink/60">{formatDateLabel(asset.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-ink/60">暂无媒体，先上传文件或登记一个外部地址。</p>
        )}
      </AdminSection>
    </div>
  );
}
