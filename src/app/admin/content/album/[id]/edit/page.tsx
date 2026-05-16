import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSection } from "@/components/admin/admin-section";
import { AlbumForm } from "@/components/admin/album-form";
import { updateAlbumItem } from "@/features/admin/album-actions";
import { getAdminAlbumItem } from "@/features/admin/album-data";
import { getAdminMediaAssets } from "@/features/admin/media-data";

export default async function EditAlbumItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, mediaAssets] = await Promise.all([getAdminAlbumItem(id), getAdminMediaAssets()]);

  if (!item) {
    notFound();
  }

  return (
    <div className="grid gap-5">
      <div>
        <Link className="text-sm text-blush-700" href="/admin/content/album">
          返回相册管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">编辑相册</h1>
      </div>
      <AdminSection title="相册内容">
        <AlbumForm action={updateAlbumItem} item={item} mediaAssets={mediaAssets} />
      </AdminSection>
    </div>
  );
}
