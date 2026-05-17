const SERVER_ACTION_BODY_LIMIT_PATTERN = /Body exceeded .* limit/i;
const NEXT_REDIRECT_ERROR_CODE = "NEXT_REDIRECT";
const NEXT_REDIRECT_DIGEST_PATTERN = /^NEXT_REDIRECT;(push|replace);(.+?);(?:30[378]|200);?$/;

type RedirectError = Error & {
  digest?: string;
};

export function formatActionErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";

  if (SERVER_ACTION_BODY_LIMIT_PATTERN.test(message)) {
    return "文件大小超过限制，请上传不超过 10 MB 的文件。";
  }

  return message.trim() || fallback;
}

export function isNextRedirectError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const digest = (error as RedirectError).digest;

  return (
    error.message === NEXT_REDIRECT_ERROR_CODE ||
    (typeof digest === "string" && digest.startsWith(NEXT_REDIRECT_ERROR_CODE))
  );
}

export function getNextRedirectTarget(error: unknown) {
  if (!isNextRedirectError(error)) {
    return null;
  }

  const digest = (error as RedirectError).digest;

  if (!digest) {
    return null;
  }

  const match = digest.match(NEXT_REDIRECT_DIGEST_PATTERN);

  if (!match) {
    return null;
  }

  return {
    mode: match[1] as "push" | "replace",
    url: match[2]
  };
}
