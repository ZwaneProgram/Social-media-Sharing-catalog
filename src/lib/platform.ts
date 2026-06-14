export type Platform = "youtube" | "instagram" | "facebook" | "other";

export function detectPlatform(url: string): Platform {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "other";
  }
  if (host === "youtube.com" || host === "youtu.be" || host.endsWith(".youtube.com")) {
    return "youtube";
  }
  if (host === "instagram.com" || host.endsWith(".instagram.com")) {
    return "instagram";
  }
  if (host === "facebook.com" || host === "fb.watch" || host.endsWith(".facebook.com")) {
    return "facebook";
  }
  return "other";
}
