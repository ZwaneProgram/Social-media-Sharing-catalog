// One-time: re-host existing Instagram/Facebook thumbnails to Vercel Blob so the
// items you saved before Blob caching existed don't break when their signed URLs
// expire. Requires DATABASE_URL and BLOB_READ_WRITE_TOKEN in your env.
//
//   1. Create the Blob store in Vercel (Storage tab).
//   2. Pull the token locally:  npx vercel env pull .env.local
//      (or paste BLOB_READ_WRITE_TOKEN into .env)
//   3. Run:  node scripts/recache-thumbnails.mjs
import "dotenv/config";
import pg from "pg";
import { put } from "@vercel/blob";

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN is not set. See the steps at the top of this file.");
  process.exit(1);
}

const RECACHE = ["instagram", "facebook", "other"];
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(
  'SELECT id, platform, "thumbnailUrl" FROM "Item" WHERE platform = ANY($1) AND "thumbnailUrl" IS NOT NULL',
  [RECACHE]
);

let moved = 0;
for (const row of rows) {
  // Skip ones already on Blob.
  if (row.thumbnailUrl.includes(".blob.vercel-storage.com")) continue;
  try {
    const res = await fetch(row.thumbnailUrl, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; ContentCatalog/1.0)" },
    });
    if (!res.ok) {
      console.log(`skip ${row.id}: source ${res.status}`);
      continue;
    }
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const ext = contentType.split("/")[1]?.split(";")[0] || "jpg";
    const bytes = await res.arrayBuffer();
    const blob = await put(`thumbnails/${crypto.randomUUID()}.${ext}`, bytes, {
      access: "public",
      contentType,
    });
    await client.query('UPDATE "Item" SET "thumbnailUrl" = $1 WHERE id = $2', [blob.url, row.id]);
    moved++;
    console.log(`re-hosted ${row.id}`);
  } catch (err) {
    console.log(`skip ${row.id}: ${err.message}`);
  }
}

console.log(`Done. Re-hosted ${moved} of ${rows.length} thumbnails.`);
await client.end();
