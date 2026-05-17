const SERVER_ACTION_BODY_LIMIT_PATTERN = /Body exceeded .* limit/i;

export function formatActionErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";

  if (SERVER_ACTION_BODY_LIMIT_PATTERN.test(message)) {
    return "文件大小超过限制，请上传不超过 10 MB 的文件。";
  }

  return message.trim() || fallback;
}
