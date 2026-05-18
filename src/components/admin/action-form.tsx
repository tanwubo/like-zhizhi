"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState, useTransition } from "react";

import { formatActionErrorMessage, getNextRedirectTarget, isNextRedirectError } from "@/lib/action-error";

type AdminActionFormProps = {
  action: (formData: FormData) => void | Promise<void | { ok: boolean; error?: string }>;
  children: ReactNode;
  className?: string;
  errorTitle?: string;
  fallbackError?: string;
};

export function AdminActionForm({
  action,
  children,
  className,
  errorTitle = "操作失败",
  fallbackError = "系统接口异常，请稍后重试。"
}: AdminActionFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setError(null);
    startTransition(async () => {
      try {
        const result = await action(formData);
        if (result && typeof result === "object" && "ok" in result && !result.ok) {
          setError(result.error ?? fallbackError);
          return;
        }
        router.refresh();
      } catch (caught) {
        if (isNextRedirectError(caught)) {
          const redirect = getNextRedirectTarget(caught);

          if (redirect) {
            if (redirect.mode === "push") {
              router.push(redirect.url);
            } else {
              router.replace(redirect.url);
            }
          } else {
            router.refresh();
          }

          return;
        }

        setError(formatActionErrorMessage(caught, fallbackError));
      }
    });
  }

  return (
    <>
      <form className={className} onSubmit={handleSubmit}>
        <fieldset className="contents" disabled={isPending} aria-busy={isPending}>
          {children}
        </fieldset>
      </form>
      {error ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4" role="alertdialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-lg border border-blush-100 bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold text-ink">{errorTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">{error}</p>
            <button
              aria-label="关闭弹窗"
              className="mt-5 rounded-md bg-blush-600 px-4 py-2 text-sm font-medium text-white hover:bg-blush-700"
              onClick={() => setError(null)}
              type="button"
            >
              我知道了
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
