import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSection } from "@/components/admin/admin-section";
import { MusicForm } from "@/components/admin/music-form";
import { updateMusicTrack } from "@/features/admin/music-actions";
import { getAdminMusicTrack } from "@/features/admin/music-data";

export default async function EditMusicTrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await getAdminMusicTrack(id);

  if (!track) {
    notFound();
  }

  return (
    <div className="grid gap-5">
      <div>
        <Link className="text-sm text-blush-700" href="/admin/content/music">
          返回音乐管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">编辑音乐</h1>
      </div>
      <AdminSection title="音乐内容">
        <MusicForm action={updateMusicTrack} track={track} />
      </AdminSection>
    </div>
  );
}
