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
import { storage } from "@/server/storage/s3-storage";

type StorageAdapter = {
  putObject(input: { key: string; body: Buffer; contentType: string }): Promise<{
    bucket: string;
    key: string;
    publicUrl: string;
  }>;
};

export { validateExternalMediaInput as validateMediaInput };

export type UploadResult = { ok: true } | { ok: false; error: string };

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

export async function uploadMediaAsset(formData: FormData, adapter: StorageAdapter = storage): Promise<UploadResult> {
  "use server";

  await requireAdminCapability("content");

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
  const uploaded = await adapter.putObject({
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
