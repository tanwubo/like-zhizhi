import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { LoveDayForm } from "@/components/admin/love-day-form";
import { createLoveDayEvent } from "@/features/admin/love-days-actions";

export default function NewLoveDayEventPage() {
  return (
    <div className="grid gap-5">
      <div>
        <Link className="text-sm text-blush-700" href="/admin/content/love-days">
          返回纪念日管理
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">新建纪念日</h1>
      </div>
      <AdminSection title="纪念日内容">
        <LoveDayForm action={createLoveDayEvent} />
      </AdminSection>
    </div>
  );
}
