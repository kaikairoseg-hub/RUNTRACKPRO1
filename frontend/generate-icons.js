/**
 * generate-icons.js
 *
 * Generates icon-192.png and icon-512.png in frontend/public/icons/
 * using only Node.js built-ins (no canvas dependency required).
 *
 * Each icon is a solid square filled with the RunTrackPro brand colour #FC4C02.
 *
 * Run from the frontend/ directory:
 *   node generate-icons.js
 *
 * Replace the output files with your final artwork before shipping.
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import zlib from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Brand colour #FC4C02 → R=252, G=76, B=2
const BRAND_R = 0xfc;
const BRAND_G = 0x4c;
const BRAND_B = 0x02;

/**
 * Write a minimal PNG: solid colour square, no alpha.
 * @param {string} filePath   Destination file path
 * @param {number} size       Width and height in pixels
 * @param {number} r          Red channel 0-255
 * @param {number} g          Green channel 0-255
 * @param {number} b          Blue channel 0-255
 */
function writeSolidPng(filePath, size, r, g, b) {
  // --- PNG signature ---
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // --- IHDR chunk (width, height, bit depth 8, colour type 2 = RGB) ---
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);  // width
  ihdrData.writeUInt32BE(size, 4);  // height
  ihdrData[8] = 8;                  // bit depth
  ihdrData[9] = 2;                  // colour type: RGB
  ihdrData[10] = 0;                 // compression
  ihdrData[11] = 0;                 // filter
  ihdrData[12] = 0;                 // interlace
  const ihdr = makeChunk("IHDR", ihdrData);

  // --- IDAT chunk (raw image data, zlib-compressed) ---
  // Each row: filter byte (0 = None) followed by width × 3 RGB bytes
  const rowBytes = 1 + size * 3;
  const raw = Buffer.alloc(size * rowBytes);
  for (let y = 0; y < size; y++) {
    const off = y * rowBytes;
    raw[off] = 0; // filter byte None
    for (let x = 0; x < size; x++) {
      raw[off + 1 + x * 3 + 0] = r;
      raw[off + 1 + x * 3 + 1] = g;
      raw[off + 1 + x * 3 + 2] = b;
    }
  }
  const compressed = zlib.deflateSync(raw);
  const idat = makeChunk("IDAT", compressed);

  // --- IEND chunk ---
  const iend = makeChunk("IEND", Buffer.alloc(0));

  const png = Buffer.concat([sig, ihdr, idat, iend]);
  writeFileSync(filePath, png);
  console.log(`Written: ${filePath} (${size}×${size}, ${png.length} bytes)`);
}

/**
 * Build a PNG chunk: length (4) + type (4) + data + CRC32 (4).
 */
function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.concat([typeBytes, data]);
  const crc = crc32(crcBuf);
  const crcOut = Buffer.alloc(4);
  crcOut.writeInt32BE(crc, 0);
  return Buffer.concat([len, typeBytes, data, crcOut]);
}

// Standard CRC-32 implementation (PNG spec table)
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ -1;
}

// ---- Generate icons ----
const iconsDir = join(__dirname, "public", "icons");

writeSolidPng(join(iconsDir, "icon-192.png"), 192, BRAND_R, BRAND_G, BRAND_B);
writeSolidPng(join(iconsDir, "icon-512.png"), 512, BRAND_R, BRAND_G, BRAND_B);

console.log("Done. Replace these placeholder icons with final artwork before release.");
