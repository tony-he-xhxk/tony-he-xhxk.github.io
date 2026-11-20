import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const postsDir = path.join(repoRoot, "_posts");
const ffmpeg = process.env.FFMPEG || "ffmpeg";
let generated = 0;
let skipped = 0;
let failed = 0;

for (const entry of fs.readdirSync(postsDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
  const markdown = fs.readFileSync(path.join(postsDir, entry.name), "utf8");
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) continue;

  for (const match of frontmatter[1].matchAll(/^\s*-\s+src:\s+(\/assets\/images\/posts\/[^\r\n]+)\s*$/gm)) {
    const sourcePath = path.join(repoRoot, ...match[1].trim().split("/").filter(Boolean));
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Missing source image: ${sourcePath}`);
      failed += 1;
      continue;
    }

    const thumbPath = path.join(
      path.dirname(sourcePath),
      "thumbs",
      path.basename(sourcePath).replace(/\.(?:png|jpe?g|webp)$/i, ".webp"),
    );
    fs.mkdirSync(path.dirname(thumbPath), { recursive: true });

    if (fs.existsSync(thumbPath) && fs.statSync(thumbPath).mtimeMs >= fs.statSync(sourcePath).mtimeMs) {
      skipped += 1;
      continue;
    }

    const result = spawnSync(
      ffmpeg,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        sourcePath,
        "-vf",
        "scale=400:-2:flags=lanczos",
        "-c:v",
        "libwebp",
        "-quality",
        "78",
        "-compression_level",
        "6",
        thumbPath,
      ],
      { encoding: "utf8" },
    );

    if (result.status === 0) {
      generated += 1;
      console.log(`generated ${path.relative(repoRoot, thumbPath)}`);
    } else {
      failed += 1;
      console.error(result.stderr || `ffmpeg failed for ${sourcePath}`);
    }
  }
}

console.log(`Gallery thumbnails: ${generated} generated, ${skipped} current, ${failed} failed.`);
if (failed) process.exitCode = 1;
