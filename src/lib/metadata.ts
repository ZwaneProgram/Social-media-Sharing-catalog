import { detectPlatform, type Platform } from "@/lib/platform";

export interface LinkMetadata {
  title: string;
  thumbnailUrl: string | null;
  platform: Platform;
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
    if (m) return m[1];
  }
  return null;
}

async function fetchYouTube(url: string): Promise<LinkMetadata> {
  const oembed = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
  const res = await fetch(oembed);
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
