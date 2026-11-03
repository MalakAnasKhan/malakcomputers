import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { createIco } from './generate-ico.mjs';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const appDir = path.join(rootDir, 'src', 'app');

// High precision vector SVG for Malak Computers brand:
// Dark graphite #101114 squircle with subtle inner border and vibrant electric lime #D6FF43 "MC"
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181A1F"/>
      <stop offset="100%" stop-color="#0E0F12"/>
    </linearGradient>
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#D6FF43" flood-opacity="0.15"/>
    </filter>
  </defs>
  <!-- Background squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <rect x="14" y="14" width="484" height="484" rx="100" fill="none" stroke="#24272D" stroke-width="12"/>
  <rect x="24" y="24" width="464" height="464" rx="90" fill="none" stroke="#D6FF43" stroke-opacity="0.12" stroke-width="4"/>

  <!-- Monogram MC in signature Electric Lime -->
  <g filter="url(#glow)">
    <text x="256" y="292" text-anchor="middle" dominant-baseline="central"
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          font-weight="900" font-size="256" letter-spacing="-14" fill="#D6FF43">MC</text>
  </g>
</svg>`;

async function buildIcons() {
  console.log('Generating Malak Computers icons and favicons...');
  const svgBuffer = Buffer.from(svgContent);

  // Write SVGs
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgContent, 'utf8');
  console.log('✓ Wrote public/icon.svg and src/app/icon.svg');

  // Generate PNG sizes
  const sizes = [
    { name: 'icon-16.png', size: 16, dest: 'public' },
    { name: 'icon-32.png', size: 32, dest: 'public' },
    { name: 'icon-48.png', size: 48, dest: 'public' },       // Google Search requirement
    { name: 'icon-96.png', size: 96, dest: 'public' },       // 2x Google Search
    { name: 'apple-touch-icon.png', size: 180, dest: 'public' },
    { name: 'apple-icon.png', size: 180, dest: 'app' },
    { name: 'icon-192.png', size: 192, dest: 'public' },     // PWA / Android
    { name: 'icon-512.png', size: 512, dest: 'public' },     // Knowledge Graph / Schema.org
  ];

  const pngBuffers = {};

  for (const { name, size, dest } of sizes) {
    const targetDir = dest === 'app' ? appDir : publicDir;
    const outPath = path.join(targetDir, name);
    const buf = await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    fs.writeFileSync(outPath, buf);
    pngBuffers[size] = buf;
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }

  // Create multi-size ICO containing 16x16, 32x32, 48x48
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: pngBuffers[16] },
    { width: 32, height: 32, buffer: pngBuffers[32] },
    { width: 48, height: 48, buffer: pngBuffers[48] },
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Generated public/favicon.ico and src/app/favicon.ico (16, 32, 48px multi-size ICO)');
  console.log('All icons generated successfully!');
}

buildIcons().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});

