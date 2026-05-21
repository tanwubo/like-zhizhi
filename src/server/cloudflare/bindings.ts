type CloudflareContext = {
  env: {
    DB?: D1Database;
    MEDIA_BUCKET?: R2Bucket;
  };
};

export async function getCloudflareContextSafe(): Promise<CloudflareContext | undefined> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const context = mod.getCloudflareContext?.();
    return context as CloudflareContext | undefined;
  } catch {
    return undefined;
  }
}
