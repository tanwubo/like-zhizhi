import { notFound } from "next/navigation";

import { AdminSection } from "@/components/admin/admin-section";
import { NoteForm } from "@/components/admin/note-form";
import { updateNote } from "@/features/admin/notes-actions";
import { getAdminNote } from "@/features/admin/notes-data";

export const dynamic = "force-dynamic";

export default async function EditAdminNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await getAdminNote(id);

  if (!note) {
    notFound();
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">编辑点滴</h1>
        <p className="mt-1 text-sm text-ink/60">修改标题、正文、发布状态和基础元信息。</p>
      </div>
      <AdminSection title="点滴内容">
        <NoteForm action={updateNote} note={note} />
      </AdminSection>
    </div>
  );
}
