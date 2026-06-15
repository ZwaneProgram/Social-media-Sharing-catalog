import { put } from "@vercel/blob";
import type { Platform } from "@/lib/platform";

// Instagram/Facebook (and many "other" sites) hand out short-lived *signed*
// image URLs that expire after a few days. To keep thumbnails working forever we
// download the image once at save-time and re-host a permanent copy on Vercel
// Blob. YouTube thumbnails are already permanent, so we leave those untouched.
const CACHE_PLATFORMS = new Set<Platform>(["instagram", "facebook", "other"]);

/**
 * Best-effort: returns a permanent Blob URL for the thumbnail, or the original
 * URL if caching isn't possible (no token, fetch failed, not an image, etc.).
 * Caching must never block a save, so every failure falls back gracefully.
 */
export async function cacheThumbnail(
  sourceUrl: string | null,
  platform: Platform
): Promise<string | null> {
  if (!sourceUrl) return null;
  if (!CACHE_PLATFORMS.has(platform)) return sourceUrl;
  // No Blob store configured (e.g. local dev without a token) — keep the original.
  if (!process.env.BLOB_READ_WRITE_TOKEN) return sourceUrl;

  try {
    const res = await fetch(sourceUrl, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; ContentCatalog/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return sourceUrl;

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) return sourceUrl;

    const bytes = await res.arrayBuffer();
    const ext = contentType.split("/")[1]?.split(";")[0] || "jpg";
    const blob = await put(`thumbnails/${crypto.randomUUID()}.${ext}`, bytes, {
      access: "public",
      contentType,
    });
    return blob.url;
  } catch {
    return sourceUrl;
  }
}
