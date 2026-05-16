import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { MusicForm } from "@/components/admin/music-form";
import { createMusicTrack } from "@/features/admin/music-actions";

export default function NewMusicTrackPage() {
  return (
    <div className="grid gap-5">
      <div>
        <Link className="text-sm text-blush-700" href="/admin/content/music">
          返回音乐管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">新建音乐</h1>
      </div>
      <AdminSection title="音乐内容">
        <MusicForm action={createMusicTrack} />
      </AdminSection>
    </div>
  );
}
