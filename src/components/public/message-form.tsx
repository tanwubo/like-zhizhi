"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";

type Errors = Record<string, string[]>;

export function MessageForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    setErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: formData.get("nickname"),
        content: formData.get("content")
      })
    });
    const payload = (await response.json()) as { ok: boolean; errors?: Errors };

    setSubmitting(false);

    if (!response.ok || !payload.ok) {
      setErrors(payload.errors ?? { form: ["提交失败，请稍后再试"] });
      return;
    }

    form.reset();
    setStatus("留言已提交，审核通过后会展示在留言墙。");
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-blush-100 bg-white/80 p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-ink">写一条祝福</h2>
      <div className="mt-4 grid gap-4">
        <label className="grid gap-2 text-sm text-ink/70">
          昵称
          <input
            name="nickname"
            className="rounded-md border border-blush-100 bg-white px-3 py-2 text-ink outline-none focus:border-blush-400"
            maxLength={24}
          />
          {errors.nickname?.[0] ? <span className="text-xs text-red-500">{errors.nickname[0]}</span> : null}
        </label>
        <label className="grid gap-2 text-sm text-ink/70">
          留言
          <textarea
            name="content"
            className="min-h-28 rounded-md border border-blush-100 bg-white px-3 py-2 text-ink outline-none focus:border-blush-400"
            maxLength={500}
          />
          {errors.content?.[0] ? <span className="text-xs text-red-500">{errors.content[0]}</span> : null}
        </label>
        {errors.form?.[0] ? <p className="text-sm text-red-500">{errors.form[0]}</p> : null}
        {status ? <p className="text-sm text-blush-700">{status}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "提交中..." : "提交留言"}
        </Button>
      </div>
    </form>
  );
}
