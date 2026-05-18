import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminActionForm } from "@/components/admin/action-form";

const router = {
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn()
};

vi.mock("next/navigation", () => ({
  useRouter: () => router
}));

describe("AdminActionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("treats Next.js redirect signals as successful submissions", async () => {
    const redirect = new Error("NEXT_REDIRECT");
    Object.defineProperty(redirect, "digest", {
      value: "NEXT_REDIRECT;replace;/admin/media;307;",
      enumerable: true
    });

    render(
      <AdminActionForm action={async () => Promise.reject(redirect)} errorTitle="上传失败">
        <button type="submit">上传媒体</button>
      </AdminActionForm>
    );

    fireEvent.click(screen.getByRole("button", { name: "上传媒体" }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/admin/media"));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("keeps real action errors on the current page with a close button", async () => {
    render(
      <AdminActionForm action={async () => Promise.reject(new Error("S3 上传失败"))} errorTitle="上传失败">
        <button type="submit">上传媒体</button>
      </AdminActionForm>
    );

    fireEvent.click(screen.getByRole("button", { name: "上传媒体" }));

    expect(await screen.findByRole("alertdialog")).toHaveTextContent("S3 上传失败");
    fireEvent.click(screen.getByRole("button", { name: "关闭弹窗" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("shows returned action errors without refreshing the page", async () => {
    render(
      <AdminActionForm action={async () => ({ ok: false, error: "外部媒体数据无效" })} errorTitle="登记失败">
        <button type="submit">登记外部媒体</button>
      </AdminActionForm>
    );

    fireEvent.click(screen.getByRole("button", { name: "登记外部媒体" }));

    expect(await screen.findByRole("alertdialog")).toHaveTextContent("外部媒体数据无效");
    expect(router.refresh).not.toHaveBeenCalled();
  });
});
