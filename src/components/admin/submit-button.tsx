"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function SubmitButton({ children }: { children: string }) {
  const status = useFormStatus();

  return (
    <Button type="submit" disabled={status.pending}>
      {status.pending ? "保存中..." : children}
    </Button>
  );
}
