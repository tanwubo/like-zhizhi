"use client";

import { MediaType } from "@prisma/client";
import { FileText, Film, ImageIcon, Music, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DeleteMediaResult } from "@/features/admin/media-actions";
import { formatDateLabel } from "@/lib/date";

type MediaAssetItem = {
  id: string;
  type: MediaType;
  filename: string;
  publicUrl: string;
  contentType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: Date;
};

const mediaTypeLabels: Record<MediaType, string> = {
  IMAGE: "图片",
  VIDEO: "视频",
  AUDIO: "音频",
  FILE: "文件"
};

const typeIconMap: Record<MediaType, typeof ImageIcon> = {
  IMAGE: ImageIcon,
  VIDEO: Film,
  AUDIO: Music,
  FILE: FileText
};

function formatSize(sizeBytes: number) {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
  }
  if (sizeBytes >= 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${sizeBytes} B`;
}

function fileExtension(filename: string) {
  return filename.split(".").pop()?.toUpperCase() ?? "?";
}

type MediaGridProps = {
  assets: MediaAssetItem[];
  deleteAction: (ids: string[]) => Promise<DeleteMediaResult>;
};

function MediaCard({
  asset,
  checked,
  onCheckedChange
}: {
  asset: MediaAssetItem;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const Icon = typeIconMap[asset.type];
  const isImage = asset.type === MediaType.IMAGE;

  return (
    <article
      className={`relative rounded-lg border bg-white shadow-soft transition ${
        checked ? "border-blush-500 ring-2 ring-blush-100" : "border-blush-100 hover:border-blush-300 hover:shadow-md"
      }`}
    >
      <label className="absolute left-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm">
        <span className="sr-only">选择 {asset.filename}</span>
        <input
          checked={checked}
          className="h-4 w-4 accent-blush-600"
          onChange={(event) => onCheckedChange(event.target.checked)}
          type="checkbox"
        />
      </label>
      <a className="group block" href={asset.publicUrl} rel="noreferrer" target="_blank">
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-blush-50">
          {isImage ? (
            <div
              aria-label={asset.filename}
              className="h-full bg-cover bg-center transition group-hover:scale-105"
              role="img"
              style={{ backgroundImage: `url("${asset.publicUrl}")` }}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-ink/30">
              <Icon className="h-10 w-10" />
              <span className="text-xs font-medium">{fileExtension(asset.filename)}</span>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <p className="truncate text-xs font-medium text-ink" title={asset.filename}>
            {asset.filename}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <Badge variant="secondary">{mediaTypeLabels[asset.type]}</Badge>
            <span className="text-[10px] text-ink/45">{formatSize(asset.sizeBytes)}</span>
          </div>
          <p className="mt-1 text-[10px] text-ink/35">{formatDateLabel(asset.createdAt)}</p>
        </div>
      </a>
    </article>
  );
}

export function MediaGrid({ assets, deleteAction }: MediaGridProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  if (!assets.length) {
    return <p className="text-sm text-ink/60">暂无媒体，先上传文件或登记一个外部地址。</p>;
  }

  const allSelected = selectedIds.length === assets.length;

  function setAssetSelected(id: string, checked: boolean) {
    setError(null);
    setSelectedIds((current) => {
      if (checked) {
        return current.includes(id) ? current : [...current, id];
      }

      return current.filter((selectedId) => selectedId !== id);
    });
  }

  function toggleAll(checked: boolean) {
    setError(null);
    setSelectedIds(checked ? assets.map((asset) => asset.id) : []);
  }

  function handleDeleteSelected() {
    if (selectedIds.length === 0 || isPending) {
      return;
    }

    const confirmed = window.confirm(`确定删除已选的 ${selectedIds.length} 个媒体资源吗？`);
    if (!confirmed) {
      return;
    }

    const idsToDelete = selectedIds;
    setError(null);
    startTransition(async () => {
      const result = await deleteAction(idsToDelete);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSelectedIds([]);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blush-100 bg-blush-50/40 px-3 py-2">
        <label className="inline-flex items-center gap-2 text-sm text-ink/70">
          <input
            checked={allSelected}
            className="h-4 w-4 accent-blush-600"
            onChange={(event) => toggleAll(event.target.checked)}
            type="checkbox"
          />
          全选
        </label>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 ? <span className="text-sm text-ink/60">已选择 {selectedIds.length} 个媒体</span> : null}
          <Button disabled={selectedIds.length === 0 || isPending} onClick={handleDeleteSelected} type="button" variant="destructive">
            <Trash2 className="h-4 w-4" />
            {isPending ? "删除中..." : `删除已选 ${selectedIds.length} 个`}
          </Button>
        </div>
      </div>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {assets.map((asset) => (
          <MediaCard
            key={asset.id}
            asset={asset}
            checked={selectedSet.has(asset.id)}
            onCheckedChange={(checked) => setAssetSelected(asset.id, checked)}
          />
        ))}
      </div>
    </div>
  );
}
