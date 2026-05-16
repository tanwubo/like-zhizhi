import { AdminSection } from "@/components/admin/admin-section";
import { NoteForm } from "@/components/admin/note-form";
import { getAdminMediaAssets } from "@/features/admin/media-data";
import { createNote } from "@/features/admin/notes-actions";

export default async function NewAdminNotePage() {
  const mediaAssets = await getAdminMediaAssets();

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">新建点滴</h1>
        <p className="mt-1 text-sm text-ink/60">先保存为草稿，确认内容后再发布到公开页面。</p>
      </div>
      <AdminSection title="点滴内容">
        <NoteForm action={createNote} mediaAssets={mediaAssets} />
      </AdminSection>
    </div>
  );
}
