"use strict";

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const pngToIco = require("png-to-ico").default;

const root = process.cwd();
const svgPath = path.join(root, "build-resources", "icon.svg");
const outDir = path.join(root, "build-resources");
const sizes = [16, 24, 32, 48, 64, 128, 256];

async function main() {
  const svg = fs.readFileSync(svgPath);
  const base = sharp(svg);
  const pngBuffers = await Promise.all(
    sizes.map((size) => base.clone().resize(size, size).png().toBuffer()),
  );
  sizes.forEach((size, i) => {
    fs.writeFileSync(path.join(outDir, `icon-${size}.png`), pngBuffers[i]);
  });
  fs.writeFileSync(path.join(outDir, "icon.png"), pngBuffers.at(-1));
  const ico = await pngToIco(pngBuffers);
  fs.writeFileSync(path.join(outDir, "icon.ico"), ico);
  console.log(`Wrote build-resources/icon.ico (${ico.length} bytes, ${sizes.length} sizes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
