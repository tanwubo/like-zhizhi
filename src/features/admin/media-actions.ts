import { revalidatePath } from "next/cache";

import {
  buildMediaObjectKey,
  detectMediaType,
  inferContentType,
  parseExternalMediaInput,
  readImageDimensions,
  validateExternalMediaInput
} from "@/features/admin/media-utils";
import { requireAdminCapability } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { getStorage } from "@/server/storage";
import type { StorageAdapter } from "@/server/storage/types";

export { validateExternalMediaInput as validateMediaInput };

export type UploadResult = { ok: true } | { ok: false; error: string };
export type DeleteMediaResult = { ok: true; deletedCount: number } | { ok: false; error: string };

type UploadedFile = {
  name: string;
  size: number;
  type: string;
  arrayBuffer?: () => Promise<ArrayBuffer>;
};

function revalidateMediaPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/media");
}

function fileFromFormData(formData: FormData) {
  const file = formData.get("file");
  if (
    !file ||
    typeof file !== "object" ||
    !("name" in file) ||
    !("size" in file) ||
    typeof file.name !== "string" ||
    typeof file.size !== "number" ||
    file.size === 0
  ) {
    return null;
  }

  return file as UploadedFile;
}

async function bufferFromUploadedFile(file: UploadedFile) {
  if (typeof file.arrayBuffer === "function") {
    return Buffer.from(await file.arrayBuffer());
  }

  for (const symbol of Object.getOwnPropertySymbols(file)) {
    const implementation = (file as unknown as Record<symbol, { _buffer?: unknown }>)[symbol];
    if (Buffer.isBuffer(implementation?._buffer)) {
      return Buffer.from(implementation._buffer);
    }
  }

  return null;
}

export async function registerExternalMedia(formData: FormData): Promise<UploadResult> {
  "use server";

  await requireAdminCapability("content");

  const parsed = parseExternalMediaInput(formData);
  if (!parsed.ok) {
    return { ok: false, error: "外部媒体数据无效" };
  }

  await prisma.mediaAsset.create({ data: parsed.data });
  revalidateMediaPaths();
  return { ok: true };
}

export async function uploadMediaAsset(formData: FormData, adapter?: StorageAdapter): Promise<UploadResult> {
  "use server";

  await requireAdminCapability("content");
  const resolvedAdapter = adapter ?? (await getStorage());

  const file = fileFromFormData(formData);
  if (!file) {
    return { ok: false, error: "未选择文件" };
  }

  const body = await bufferFromUploadedFile(file);
  if (!body) {
    return { ok: false, error: "文件读取失败" };
  }

  const contentType = inferContentType(file.name, file.type);
  const key = buildMediaObjectKey(file.name);
  const uploaded = await resolvedAdapter.putObject({
    key,
    body,
    contentType
  });
  const dimensions = readImageDimensions(body, contentType);

  await prisma.mediaAsset.create({
    data: {
      type: detectMediaType(contentType, file.name),
      bucket: uploaded.bucket,
      objectKey: uploaded.key,
      publicUrl: uploaded.publicUrl,
      filename: file.name,
      contentType,
      sizeBytes: file.size,
      width: dimensions.width,
      height: dimensions.height
    }
  });

  revalidateMediaPaths();
  return { ok: true };
}

export async function deleteMediaAssets(ids: string[]): Promise<DeleteMediaResult> {
  "use server";

  await requireAdminCapability("content");

  const uniqueIds = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));
  if (uniqueIds.length === 0) {
    return { ok: false, error: "未选择媒体资源" };
  }

  const result = await prisma.mediaAsset.deleteMany({
    where: {
      id: {
        in: uniqueIds
      }
    }
  });

  revalidateMediaPaths();
  return { ok: true, deletedCount: result.count };
}
