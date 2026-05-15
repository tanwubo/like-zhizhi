"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password")
      })
    });

    if (response.ok) {
      router.push("/admin");
      router.refresh();
      return;
    }

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    setMessage(payload?.message ?? "登录失败");
    setSubmitting(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-ink">后台登录</h1>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm text-ink/70">
            邮箱
            <input
              className="rounded-md border border-blush-100 px-3 py-2"
              name="email"
              type="email"
              required
            />
          </label>
          <label className="grid gap-2 text-sm text-ink/70">
            密码
            <input
              className="rounded-md border border-blush-100 px-3 py-2"
              name="password"
              type="password"
              required
            />
          </label>
          {message ? <p className="text-sm text-blush-700">{message}</p> : null}
          <button
            className="rounded-md bg-blush-500 px-4 py-2 font-medium text-white disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "登录中" : "登录"}
          </button>
        </form>
        <p className="mt-4 text-xs text-ink/50">种子账号：owner@example.com / ChangeMe123!</p>
      </Card>
    </main>
  );
}
