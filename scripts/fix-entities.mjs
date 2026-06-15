// One-time cleanup: decode HTML entities in already-saved items so old
// Instagram/Facebook thumbnails (and titles) that were stored with &amp; work.
// Run with:  node scripts/fix-entities.mjs
import "dotenv/config";
import pg from "pg";

function codePoint(n) {
  try {
    return String.fromCodePoint(n);
  } catch {
    return "";
  }
}

function decodeHtmlEntities(text) {
  if (!text) return text;
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => codePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => codePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows } = await client.query('SELECT id, title, "thumbnailUrl" FROM "Item"');
let fixed = 0;
for (const row of rows) {
  const title = decodeHtmlEntities(row.title);
  const thumb = decodeHtmlEntities(row.thumbnailUrl);
  if (title !== row.title || thumb !== row.thumbnailUrl) {
    await client.query('UPDATE "Item" SET title = $1, "thumbnailUrl" = $2 WHERE id = $3', [
      title,
      thumb,
      row.id,
    ]);
    fixed++;
  }
}

console.log(`Checked ${rows.length} items, fixed ${fixed}.`);
await client.end();
