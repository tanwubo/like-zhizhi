import { describe, expect, it } from "vitest";

import { formatActionErrorMessage } from "@/lib/action-error";

describe("action error messages", () => {
  it("shows a friendly message for Server Action body limit errors", () => {
    const message = formatActionErrorMessage(new Error("Body exceeded 1 MB limit."), "上传失败，请稍后重试。");

    expect(message).toBe("文件大小超过限制，请上传不超过 10 MB 的文件。");
  });

  it("preserves ordinary system error messages on the current page", () => {
    const message = formatActionErrorMessage(new Error("S3 上传失败"), "上传失败，请稍后重试。");

    expect(message).toBe("S3 上传失败");
  });
});
