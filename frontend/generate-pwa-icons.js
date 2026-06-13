// Simple script to copy logo2.jpg to the icons folder
// For proper PWA icons, you should convert to PNG with transparent background
// and resize to 192x192 and 512x512 using an image editor or online tool

const fs = require('fs');
const path = require('path');

const sourceLogo = path.join(__dirname, 'public', 'logo2.jpg');
const icon192 = path.join(__dirname, 'public', 'icons', 'icon-192.png');
const icon512 = path.join(__dirname, 'public', 'icons', 'icon-512.png');

console.log('To create proper PWA icons from logo2.jpg:');
console.log('1. Use an online tool like: https://www.iloveimg.com/resize-image/resize-jpg');
console.log('2. Convert logo2.jpg to PNG with transparent background');
console.log('3. Create two sizes: 192x192px and 512x512px');
console.log('4. Save as:');
console.log('   - frontend/public/icons/icon-192.png');
console.log('   - frontend/public/icons/icon-512.png');
console.log('\nOr use this quick fix: copy logo2.jpg as both icon files');
console.log('(Not ideal, but will work temporarily)');

// Quick fix: copy logo2.jpg as placeholder
if (fs.existsSync(sourceLogo)) {
  fs.copyFileSync(sourceLogo, icon192);
  fs.copyFileSync(sourceLogo, icon512);
  console.log('\n✓ Copied logo2.jpg to icon files as temporary fix');
  console.log('Note: For best results, create properly sized PNG icons');
}
