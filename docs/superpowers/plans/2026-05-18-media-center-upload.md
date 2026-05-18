# 媒体中心上传优化 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化后台媒体中心模块，支持多选拖拽上传（最多10个文件、单文件≤20MB），媒体列表改为网格卡片展示。

**Architecture:** 使用 react-dropzone 处理拖拽和多选，保持现有 Server Action 单文件上传接口，客户端循环调用。uploadMediaAsset 改为返回结果对象而非 redirect。媒体列表从 Server Component 表格改为 Client Component 网格卡片。

**Tech Stack:** Next.js 15 (App Router)、react-dropzone、shadcn/ui (Card/Badge)、lucide-react、Tailwind CSS

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `next.config.ts` | 修改 | bodySizeLimit 10mb → 20mb |
| `src/features/admin/media-actions.ts` | 修改 | uploadMediaAsset 返回值改为 `{ ok, error? }`，移除 redirect |
| `src/components/admin/media-uploader.tsx` | 新增 | 拖拽多选上传客户端组件 |
| `src/components/admin/media-grid.tsx` | 新增 | 网格卡片媒体列表客户端组件 |
| `src/app/admin/media/page.tsx` | 修改 | 使用 MediaUploader 和 MediaGrid 替换旧代码 |
| `tests/unit/media.test.ts` | 修改 | 补充 uploadMediaAsset 返回值变更的测试 |

---

### Task 1: 调整 Server Action 返回值

**Files:**
- Modify: `src/features/admin/media-actions.ts:85-125`
- Modify: `tests/unit/media.test.ts`

当前 `uploadMediaAsset` 成功后调用 `redirect`，需要改为返回 `{ ok: true } | { ok: false; error: string }`，方便客户端逐个文件处理结果。

- [ ] **Step 1: 修改 uploadMediaAsset 返回类型和实现**

在 `src/features/admin/media-actions.ts` 中：

1. 在文件顶部添加返回类型定义：

```typescript
export type UploadResult = { ok: true } | { ok: false; error: string };
```

2. 修改 `uploadMediaAsset` 函数签名，将返回类型从 `Promise<void>` 改为 `Promise<UploadResult>`：

```typescript
export async function uploadMediaAsset(formData: FormData, adapter: StorageAdapter = storage): Promise<UploadResult> {
```

3. 将函数体中的 `return;` 替换为 `return { ok: false, error: "..." }`：

- `file` 为 null 时：`return { ok: false, error: "未选择文件" };`
- `body` 为 null 时：`return { ok: false, error: "文件读取失败" };`

4. 移除函数末尾的 `revalidateMediaPaths()` 和 `redirect("/admin/media")`，替换为：

```typescript
  revalidateMediaPaths();
  return { ok: true };
```

- [ ] **Step 2: 修改 registerExternalMedia 返回类型**

同样在 `src/features/admin/media-actions.ts` 中，`registerExternalMedia` 也需要从 redirect 改为返回值：

1. 修改函数签名为：

```typescript
export async function registerExternalMedia(formData: FormData): Promise<UploadResult> {
```

2. 将 `return;` 替换为 `return { ok: false, error: "外部媒体数据无效" };`

3. 将末尾的 `redirect` 替换为：

```typescript
  revalidateMediaPaths();
  return { ok: true };
```

- [ ] **Step 3: 运行现有测试确认无破坏**

Run: `npx vitest run tests/unit/media.test.ts`
Expected: PASS（现有测试不涉及 uploadMediaAsset 和 registerExternalMedia 的返回值）

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/media-actions.ts
git commit -m "feat: uploadMediaAsset 和 registerExternalMedia 改为返回结果对象"
```

---

### Task 2: 调整 Next.js 文件大小限制

**Files:**
- Modify: `next.config.ts:4-6`

- [ ] **Step 1: 修改 bodySizeLimit**

在 `next.config.ts` 中，将 `"10mb"` 改为 `"20mb"`：

```typescript
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb"
    }
  },
```

- [ ] **Step 2: Commit**

```bash
git add next.config.ts
git commit -m "feat: Server Action bodySizeLimit 调整为 20MB"
```

---

### Task 3: 安装 react-dropzone

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装依赖**

Run: `npm install react-dropzone`
Expected: `package.json` 和 `package-lock.json` 更新，react-dropzone 添加到 dependencies

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: 添加 react-dropzone 依赖"
```

---

### Task 4: 实现 MediaUploader 组件

**Files:**
- Create: `src/components/admin/media-uploader.tsx`

这个组件负责拖拽多选上传，使用 react-dropzone + 客户端循环调用 `uploadMediaAsset`。

- [ ] **Step 1: 创建 MediaUploader 组件**

创建 `src/components/admin/media-uploader.tsx`：

```tsx
"use client";

import { UploadCloud, X, Image, Music, Film, FileText, AlertTriangle } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { uploadMediaAsset } from "@/features/admin/media-actions";

const MAX_FILES = 10;
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

const typeIcons: Record<string, typeof Image> = {
  image: Image,
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

export function MediaUploader() {
  const router = useRouter();
  const [pending, setPending] = useState<File[]>([]);
  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [uploading, setUploading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], fileRejections: { file: File; errors: { message: string }[] }[]) => {
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
        const isSizeError = rejection.errors.some((e) => e.message.includes("larger than"));
        newRejections.push({
          file: rejection.file,
          reason: isSizeError ? `超过20MB限制` : rejection.errors.map((e) => e.message).join("、"),
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
        const result = await uploadMediaAsset(formData);
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
```

- [ ] **Step 2: 验证组件无 TypeScript 错误**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: 无关于 media-uploader.tsx 的错误

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/media-uploader.tsx
git commit -m "feat: 添加 MediaUploader 拖拽多选上传组件"
```

---

### Task 5: 实现 MediaGrid 组件

**Files:**
- Create: `src/components/admin/media-grid.tsx`

这个组件以网格卡片展示媒体列表，图片类型显示缩略图，其他类型显示图标。

- [ ] **Step 1: 创建 MediaGrid 组件**

创建 `src/components/admin/media-grid.tsx`：

```tsx
"use client";

import { MediaType } from "@prisma/client";
import Image from "next/image";
import { Image as ImageIcon, Music, Film, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  FILE: "文件",
};

const typeIconMap: Record<MediaType, typeof ImageIcon> = {
  IMAGE: ImageIcon,
  VIDEO: Film,
  AUDIO: Music,
  FILE: FileText,
};

function formatSize(sizeBytes: number) {
  if (sizeBytes >= 1024 * 1024) return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
  if (sizeBytes >= 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${sizeBytes} B`;
}

function fileExtension(filename: string) {
  return filename.split(".").pop()?.toUpperCase() ?? "?";
}

function MediaCard({ asset }: { asset: MediaAssetItem }) {
  const Icon = typeIconMap[asset.type];
  const isImage = asset.type === MediaType.IMAGE;

  return (
    <a
      className="group rounded-lg border border-blush-100 bg-white shadow-soft transition hover:border-blush-300 hover:shadow-md"
      href={asset.publicUrl}
      rel="noreferrer"
      target="_blank"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-blush-50">
        {isImage ? (
          <Image
            alt={asset.filename}
            className="object-cover transition group-hover:scale-105"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            src={asset.publicUrl}
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
  );
}

export function MediaGrid({ assets }: { assets: MediaAssetItem[] }) {
  if (!assets.length) {
    return <p className="text-sm text-ink/60">暂无媒体，先上传文件或登记一个外部地址。</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {assets.map((asset) => (
        <MediaCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 验证组件无 TypeScript 错误**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: 无关于 media-grid.tsx 的错误

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/media-grid.tsx
git commit -m "feat: 添加 MediaGrid 网格卡片媒体列表组件"
```

---

### Task 6: 重构媒体中心页面

**Files:**
- Modify: `src/app/admin/media/page.tsx`

将页面从纯 Server Component 表格改为 Server + Client 混合，使用新组件。

- [ ] **Step 1: 重写媒体中心页面**

将 `src/app/admin/media/page.tsx` 重写为：

```tsx
import { AdminActionForm } from "@/components/admin/action-form";
import { AdminSection } from "@/components/admin/admin-section";
import { MediaGrid } from "@/components/admin/media-grid";
import { MediaUploader } from "@/components/admin/media-uploader";
import { SubmitButton } from "@/components/admin/submit-button";
import { registerExternalMedia } from "@/features/admin/media-actions";
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
          <MediaUploader />
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
        <MediaGrid assets={assets} />
      </AdminSection>
    </div>
  );
}
```

- [ ] **Step 2: 验证无 TypeScript 错误**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/media/page.tsx
git commit -m "feat: 媒体中心页面改用 MediaUploader 和 MediaGrid 组件"
```

---

### Task 7: 修复 AdminActionForm 对 registerExternalMedia 返回值的处理

**Files:**
- Modify: `src/components/admin/action-form.tsx`

`registerExternalMedia` 现在返回 `UploadResult` 而非 `void`，但 `AdminActionForm` 通过 `action(formData)` 调用它且不检查返回值。当前实现中 action 抛异常时会被 catch 捕获显示错误，而成功时 `router.refresh()` 刷新页面。由于 `registerExternalMedia` 不再 `redirect`，成功后 `AdminActionForm` 的 `handleSubmit` 中 `await action(formData)` 正常返回，然后 `router.refresh()` 生效。

但需要处理返回值为 `{ ok: false, error: string }` 的情况——当前 `AdminActionForm` 不检查返回值，失败结果会被静默忽略。

- [ ] **Step 1: 修改 AdminActionForm 检查 action 返回值**

在 `src/components/admin/action-form.tsx` 的 `handleSubmit` 函数中，`await action(formData)` 之后添加返回值检查：

```tsx
    startTransition(async () => {
      try {
        const result = await action(formData);
        if (result && typeof result === "object" && "ok" in result && !result.ok) {
          setError((result as { ok: false; error: string }).error);
          return;
        }
        router.refresh();
      } catch (caught) {
```

同时更新 `action` 类型签名以支持返回值：

```tsx
type AdminActionFormProps = {
  action: (formData: FormData) => void | Promise<void | { ok: boolean; error?: string }>;
```

- [ ] **Step 2: 验证无 TypeScript 错误**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/action-form.tsx
git commit -m "fix: AdminActionForm 支持 action 返回错误结果"
```

---

### Task 8: 端到端验证

- [ ] **Step 1: 运行全部单元测试**

Run: `npx vitest run`
Expected: 全部 PASS

- [ ] **Step 2: 运行 TypeScript 类型检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: 启动开发服务器并手动验证**

Run: `npm run dev`

手动验证以下场景：
1. 媒体中心页面正常加载，显示网格卡片
2. 点击拖拽区域可选择多个文件（最多10个）
3. 拖拽文件到区域可触发选择
4. 超过20MB的文件显示警告
5. 超过10个文件时多余文件显示警告
6. 点击删除按钮可移除待上传文件
7. 点击"上传媒体"按钮可成功上传
8. 上传成功后列表刷新，显示新上传的媒体
9. 外部媒体登记功能正常工作
