"use client";

export type FootprintImageAsset = {
  id: string;
  filename: string;
  publicUrl: string;
  contentType: string;
};

export function FootprintImagePicker({
  assets,
  selectedIds = []
}: {
  assets: FootprintImageAsset[];
  selectedIds?: string[];
}) {
  if (!assets.length) {
    return <p className="text-sm text-ink/55">媒体中心暂无图片，先上传照片后再绑定到记忆。</p>;
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm font-medium text-ink">记忆照片</p>
      <div className="grid gap-2 md:grid-cols-4">
        {assets.map((asset) => (
          <label key={asset.id} className="rounded-md border border-blush-100 bg-white p-2 text-xs text-ink/70">
            <span className="flex items-center gap-2">
              <input
                className="h-4 w-4 rounded border-blush-200 text-blush-600"
                defaultChecked={selectedIds.includes(asset.id)}
                name="mediaAssetIds"
                type="checkbox"
                value={asset.id}
              />
              <span className="min-w-0 flex-1 truncate">{asset.filename}</span>
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element -- media assets may use external storage hosts not configured for next/image */}
            <img alt={asset.filename} className="mt-2 aspect-square w-full rounded object-cover" src={asset.publicUrl} />
          </label>
        ))}
      </div>
    </div>
  );
}
