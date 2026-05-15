import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { ChecklistForm } from "@/components/admin/checklist-form";
import { createChecklistItem } from "@/features/admin/checklist-actions";

export default function NewChecklistItemPage() {
  return (
    <div className="grid gap-5">
      <div>
        <Link className="text-sm text-blush-700" href="/admin/content/checklist">
          返回清单管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">新建清单</h1>
      </div>
      <AdminSection title="清单内容">
        <ChecklistForm action={createChecklistItem} />
      </AdminSection>
    </div>
  );
}
