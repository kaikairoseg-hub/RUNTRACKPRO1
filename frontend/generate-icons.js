/**
 * Generates PWA icons using sharp (if available) or falls back to
 * copying logo2.png with instructions.
 * The real fix is done in vite.config.js — using separate 'any' and
 * 'maskable' purpose icons so Android renders them correctly.
 */
import { copyFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Just copy logo2.png as the icon files
// The vite.config change handles the maskable vs any split
["192", "512"].forEach((size) => {
  const src = join(__dirname, "public/logo2.png");
  const dest = join(__dirname, `public/icons/icon-${size}.png`);
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`Copied logo2.png → icon-${size}.png`);
  }
});
