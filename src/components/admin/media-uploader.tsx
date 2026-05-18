"use client";

import { AlertTriangle, FileText, Film, ImageIcon, Music, UploadCloud, X } from "lucide-react";
import { useCallback, useState } from "react";
import { ErrorCode, useDropzone, type FileRejection } from "react-dropzone";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { UploadResult } from "@/features/admin/media-actions";

const MAX_FILES = 10;
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

const typeIcons: Record<string, typeof ImageIcon> = {
  image: ImageIcon,
  audio: Music,
  video: Film,
  file: FileText,
};

function fileTypeCategory(file: File) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

type Rejection = { file: File; reason: string };

type MediaUploaderProps = {
  uploadAction: (formData: FormData) => Promise<UploadResult>;
};

export function MediaUploader({ uploadAction }: MediaUploaderProps) {
  const router = useRouter();
  const [pending, setPending] = useState<File[]>([]);
  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [uploading, setUploading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], fileRejections: FileRejection[]) => {
      setResultMessage(null);

      const newRejections: Rejection[] = [];
      const newAccepted: File[] = [];

      for (const file of accepted) {
        if (file.size > MAX_SIZE_BYTES) {
          newRejections.push({ file, reason: `超过20MB限制（${formatFileSize(file.size)}）` });
          continue;
        }
        newAccepted.push(file);
      }

      for (const rejection of fileRejections) {
        const isSizeError = rejection.errors.some((e) => e.code === ErrorCode.FileTooLarge);
        newRejections.push({
          file: rejection.file,
          reason: isSizeError ? "超过20MB限制" : rejection.errors.map((e) => e.message).join("、"),
        });
      }

      setPending((prev) => {
        const remaining = MAX_FILES - prev.length;
        const toAdd = newAccepted.slice(0, remaining);
        const overflow = newAccepted.slice(remaining);
        for (const file of overflow) {
          newRejections.push({ file, reason: `超出最多${MAX_FILES}个文件限制` });
        }
        return [...prev, ...toAdd];
      });

      setRejections((prev) => [...prev, ...newRejections]);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_SIZE_BYTES,
    multiple: true,
  });

  function removeFile(index: number) {
    setPending((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (!pending.length) return;

    setUploading(true);
    setResultMessage(null);

    let successCount = 0;
    let failCount = 0;

    for (const file of pending) {
      const formData = new FormData();
      formData.set("file", file);
      try {
        const result = await uploadAction(formData);
        if (result.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setPending([]);
    setRejections([]);
    setUploading(false);

    if (failCount === 0) {
      setResultMessage(`${successCount}个文件上传成功`);
    } else {
      setResultMessage(`${successCount}个成功，${failCount}个失败`);
    }

    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragActive
            ? "border-blush-400 bg-blush-50"
            : "border-blush-100 bg-blush-50/30 hover:border-blush-300 hover:bg-blush-50/60"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-10 w-10 text-blush-400" />
        <p className="mt-2 text-sm font-medium text-ink">
          {isDragActive ? "释放文件以上传" : "拖拽文件到此处上传"}
        </p>
        <p className="mt-1 text-xs text-ink/50">
          或点击选择文件（最多{MAX_FILES}个，单文件≤20MB）
        </p>
      </div>

      {pending.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-ink">
            已选文件（{pending.length}个）
          </p>
          <div className="grid gap-1.5">
            {pending.map((file, index) => {
              const Icon = typeIcons[fileTypeCategory(file)];
              return (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center gap-2 rounded-md bg-blush-50/50 px-3 py-2 text-sm"
                >
                  <Icon className="h-4 w-4 shrink-0 text-ink/50" />
                  <span className="min-w-0 flex-1 truncate text-ink">{file.name}</span>
                  <span className="shrink-0 text-ink/50">{formatFileSize(file.size)}</span>
                  <button
                    className="shrink-0 text-ink/30 hover:text-red-500"
                    disabled={uploading}
                    onClick={() => removeFile(index)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rejections.length > 0 && (
        <div className="grid gap-1.5">
          {rejections.map((rejection, index) => (
            <div
              key={`rejection-${index}`}
              className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{rejection.file.name}</span>
              <span className="shrink-0">{rejection.reason}</span>
            </div>
          ))}
        </div>
      )}

      {resultMessage && (
        <p
          className={`text-sm font-medium ${
            resultMessage.includes("失败") ? "text-red-600" : "text-green-600"
          }`}
        >
          {resultMessage}
        </p>
      )}

      <div className="flex justify-end">
        <Button disabled={pending.length === 0 || uploading} onClick={handleUpload} type="button">
          {uploading ? "上传中..." : "上传媒体"}
        </Button>
      </div>
    </div>
  );
}
