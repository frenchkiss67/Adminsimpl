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

fs.cpSync(staticSrc, path.join(standaloneDir, ".next", "static"), { recursive: true });
fs.cpSync(publicSrc, path.join(standaloneDir, "public"), { recursive: true });

console.log("Electron prep done — .next/standalone is self-contained.");
