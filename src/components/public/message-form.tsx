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
    <form onSubmit={onSubmit} className="rounded-xl border border-[#d2d2d7] bg-white p-5 shadow-sm">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#007aff]">Guestbook</p>
      <h2 className="mt-2 text-xl font-bold text-[#1d1d1f]">写一条祝福</h2>
      <div className="mt-4 grid gap-4">
        <label className="grid gap-2 text-sm text-[#6e6e73]">
          昵称
          <input
            name="nickname"
            className="rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 text-[#1d1d1f] outline-none transition focus:border-[#007aff] focus:ring-4 focus:ring-[rgba(0,122,255,0.08)]"
            maxLength={24}
          />
          {errors.nickname?.[0] ? <span className="text-xs text-red-500">{errors.nickname[0]}</span> : null}
        </label>
        <label className="grid gap-2 text-sm text-[#6e6e73]">
          留言
          <textarea
            name="content"
            className="min-h-28 rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 text-[#1d1d1f] outline-none transition focus:border-[#007aff] focus:ring-4 focus:ring-[rgba(0,122,255,0.08)]"
            maxLength={500}
          />
          {errors.content?.[0] ? <span className="text-xs text-red-500">{errors.content[0]}</span> : null}
        </label>
        {errors.form?.[0] ? <p className="text-sm text-red-500">{errors.form[0]}</p> : null}
        {status ? <p className="text-sm text-[#007aff]">{status}</p> : null}
        <Button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-gradient-to-br from-[#007aff] to-[#0056cc] shadow-[0_2px_8px_rgba(0,122,255,0.2)] hover:bg-[#0056cc] hover:shadow-[0_4px_16px_rgba(0,122,255,0.3)]"
        >
          {submitting ? "提交中..." : "提交留言"}
        </Button>
      </div>
    </form>
  );
}
