import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { AlbumForm } from "@/components/admin/album-form";
import { createAlbumItem } from "@/features/admin/album-actions";
import { getAdminMediaAssets } from "@/features/admin/media-data";

export default async function NewAlbumItemPage() {
  const mediaAssets = await getAdminMediaAssets();

  return (
    <div className="grid gap-5">
      <div>
        <Link className="text-sm text-blush-700" href="/admin/content/album">
          返回相册管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">新建相册</h1>
      </div>
      <AdminSection title="相册内容">
        <AlbumForm action={createAlbumItem} mediaAssets={mediaAssets} />
      </AdminSection>
    </div>
  );
}
