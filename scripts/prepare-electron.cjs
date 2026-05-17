"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const publicSrc = path.join(root, "public");

if (!fs.existsSync(standaloneDir)) {
  console.error(
    "Missing .next/standalone — run `next build` first (with output: 'standalone' in next.config.mjs).",
  );
  process.exit(1);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

copyDir(staticSrc, path.join(standaloneDir, ".next", "static"));
copyDir(publicSrc, path.join(standaloneDir, "public"));

console.log("Electron prep done — .next/standalone is self-contained.");
