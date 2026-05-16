"use client";

export type MediaSelectorAsset = {
  id: string;
  type: string;
  filename: string;
  publicUrl: string;
  contentType: string;
};

export function MediaSelector({
  assets,
  targetName,
  label = "从媒体中心选择",
  mode = "replace"
}: {
  assets: MediaSelectorAsset[];
  targetName: string;
  label?: string;
  mode?: "replace" | "appendMarkdown";
}) {
  if (!assets.length) {
    return null;
  }

  function applyAsset(asset: MediaSelectorAsset) {
    const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${targetName}"]`);
    if (!field) {
      return;
    }

    if (mode === "appendMarkdown") {
      const insertion = asset.type === "IMAGE" ? `\n![${asset.filename}](${asset.publicUrl})\n` : `\n${asset.publicUrl}\n`;
      field.value = `${field.value}${insertion}`;
    } else {
      field.value = asset.publicUrl;
    }

    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    field.focus();
  }

  return (
    <details className="rounded-md border border-blush-100 bg-blush-50/50 p-3 text-sm">
      <summary className="cursor-pointer font-medium text-ink">{label}</summary>
      <div className="mt-3 grid gap-2">
        {assets.slice(0, 8).map((asset) => (
          <button
            key={asset.id}
            className="rounded-md bg-white px-3 py-2 text-left text-ink/70 hover:text-blush-700"
            onClick={() => applyAsset(asset)}
            type="button"
          >
            <span className="block font-medium text-ink">{asset.filename}</span>
            <span className="block truncate text-xs">{asset.contentType}</span>
          </button>
        ))}
      </div>
    </details>
  );
}
