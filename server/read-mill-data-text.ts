import { readFileSync } from "node:fs";
import path from "node:path";

const TRAILING_SLASH_RE = /\/$/;
const HTTP_URL_RE = /^https?:\/\//i;

/** Load a UTF-8 text file from `public/data` (Node) or same-origin `/data/*` (Workers). */
export async function readMillDataText(
  dataDir: string,
  filename: string
): Promise<string> {
  const root = dataDir.replace(TRAILING_SLASH_RE, "");
  if (HTTP_URL_RE.test(root)) {
    const res = await fetch(`${root}/${filename}`);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch ${root}/${filename}: HTTP ${res.status}`
      );
    }
    return res.text();
  }
  return readFileSync(path.join(root, filename), "utf8");
}
