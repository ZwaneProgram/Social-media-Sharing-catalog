import { detectPlatform, type Platform } from "@/lib/platform";

export interface LinkMetadata {
  title: string;
  thumbnailUrl: string | null;
  platform: Platform;
}

// HTML attribute values are entity-encoded (e.g. & becomes &amp;). We must
// decode them, otherwise Instagram/Facebook image URLs keep their &amp; and the
// signed query string (oh/oe params) is mangled, so the CDN returns 403 and the
// thumbnail appears broken. It also cleans up titles like &quot; and &#x201c;.
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => codePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => codePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&"); // must run last so &amp;quot; isn't double-decoded
}

function codePoint(n: number): string {
  try {
    return String.fromCodePoint(n);
  } catch {
    return "";
  }
}

function extractOgTag(html: string, property: string): string | null {
  // Match <meta property="og:xxx" content="..."> in either attribute order.
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return decodeHtmlEntities(m[1]);
  }
  return null;
}

async function fetchYouTube(url: string): Promise<LinkMetadata> {
  const oembed = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
  const res = await fetch(oembed, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`oembed ${res.status}`);
  const data = (await res.json()) as { title?: string; thumbnail_url?: string };
  return {
    title: data.title ?? url,
    thumbnailUrl: data.thumbnail_url ?? null,
    platform: "youtube",
  };
}

async function fetchOpenGraph(url: string, platform: Platform): Promise<LinkMetadata> {
  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; ContentCatalog/1.0)" },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const html = await res.text();
  return {
    title: extractOgTag(html, "og:title") ?? url,
    thumbnailUrl: extractOgTag(html, "og:image"),
    platform,
  };
}

export async function fetchMetadata(url: string): Promise<LinkMetadata> {
  const platform = detectPlatform(url);
  try {
    if (platform === "youtube") return await fetchYouTube(url);
    return await fetchOpenGraph(url, platform);
  } catch {
    return { title: url, thumbnailUrl: null, platform };
  }
}
