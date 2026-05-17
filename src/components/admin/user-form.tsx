import type { UserRole } from "@prisma/client";

import { AdminActionForm } from "@/components/admin/action-form";
import { SubmitButton } from "@/components/admin/submit-button";

type UserFormValue = {
  id?: string;
  email?: string;
  name?: string;
  role?: UserRole;
};

const fieldClass =
  "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

export function UserForm({
  action,
  user
}: {
  action: (formData: FormData) => void | Promise<void>;
  user?: UserFormValue;
}) {
  const isEdit = Boolean(user?.id);

  return (
    <AdminActionForm action={action} className="grid gap-4">
      {user?.id ? <input type="hidden" name="id" value={user.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          邮箱
          <input className={fieldClass} name="email" defaultValue={user?.email ?? ""} type="email" required />
        </label>
        <label className="text-sm font-medium text-ink">
          显示名称
          <input className={fieldClass} name="name" defaultValue={user?.name ?? ""} maxLength={80} required />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          角色
          <select className={fieldClass} name="role" defaultValue={user?.role ?? "MODERATOR"}>
            <option value="OWNER">主人</option>
            <option value="PARTNER">伙伴</option>
            <option value="MODERATOR">留言管理员</option>
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          登录密码
          <input
            className={fieldClass}
            name="password"
            type="password"
            minLength={8}
            required={!isEdit}
            aria-describedby={isEdit ? "password-help" : undefined}
          />
          {isEdit ? (
            <span id="password-help" className="mt-1 block text-xs font-normal text-ink/50">
              留空则不更换密码。
            </span>
          ) : null}
        </label>
      </div>
      <div>
        <SubmitButton>保存用户</SubmitButton>
      </div>
    </AdminActionForm>
  );
}
