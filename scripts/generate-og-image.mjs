import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// OG image dimensions
const WIDTH = 1200;
const HEIGHT = 630;

// Brand colors
const NAVY = '#364c6b';
const NAVY_DARK = '#253545';
const VERY_DARK = '#1a2634';
const TERRACOTTA = '#c4613a';
const TURQUOISE = '#3a9d9b';

// SVG background with hero gradient + decorative elements
const backgroundSvg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Hero gradient -->
    <linearGradient id="hero" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${NAVY}"/>
      <stop offset="50%" stop-color="${NAVY_DARK}"/>
      <stop offset="100%" stop-color="${VERY_DARK}"/>
    </linearGradient>

    <!-- Decorative glow circles -->
    <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${TERRACOTTA}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${TERRACOTTA}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${TURQUOISE}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${TURQUOISE}" stop-opacity="0"/>
    </radialGradient>

    <!-- Subtle grid pattern -->
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" stroke-width="0.3" opacity="0.06"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#hero)"/>

  <!-- Grid overlay -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)"/>

  <!-- Decorative glow elements -->
  <ellipse cx="950" cy="120" rx="350" ry="300" fill="url(#glow1)"/>
  <ellipse cx="200" cy="500" rx="300" ry="250" fill="url(#glow2)"/>

  <!-- Accent line at top -->
  <rect x="0" y="0" width="${WIDTH}" height="4" fill="${TERRACOTTA}"/>

  <!-- Bottom decorative bar -->
  <rect x="0" y="${HEIGHT - 60}" width="${WIDTH}" height="60" fill="${VERY_DARK}" opacity="0.5"/>

  <!-- Separator line -->
  <line x1="80" y1="${HEIGHT - 60}" x2="${WIDTH - 80}" y2="${HEIGHT - 60}" stroke="white" stroke-width="0.5" opacity="0.15"/>
</svg>
`;

// SVG text overlay
const textSvg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- Tagline -->
  <text x="80" y="330" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="900" fill="white" letter-spacing="-1">
    Prepárate para el
  </text>
  <text x="80" y="395" font-family="Arial, Helvetica, sans-serif" font-size="60" font-weight="900" fill="${TERRACOTTA}" letter-spacing="-1">
    ECOEMS
  </text>

  <!-- Description -->
  <text x="80" y="450" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="white" opacity="0.65">
    Exámenes, flashcards, módulos interactivos y plan de estudio
  </text>

  <!-- Stats -->
  <text x="80" y="600" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="white" opacity="0.45" letter-spacing="2">
    128 PREGUNTAS  ·  10 ÁREAS  ·  20 MÓDULOS  ·  100% RESPONSIVA
  </text>

  <!-- URL -->
  <text x="${WIDTH - 80}" y="600" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="${TURQUOISE}" text-anchor="end" letter-spacing="1">
    tlacu.mx
  </text>
</svg>
`;

async function generate() {
  // Load and resize the logo
  const logo = await sharp(join(root, 'public/images/logos/logo-tlacu-light.webp'))
    .resize({ height: 60 })
    .toBuffer();

  const logoMeta = await sharp(logo).metadata();

  // Create the base with gradient background
  const background = await sharp(Buffer.from(backgroundSvg))
    .png()
    .toBuffer();

  // Create text layer
  const text = await sharp(Buffer.from(textSvg))
    .png()
    .toBuffer();

  // Composite everything
  const result = sharp(background)
    .composite([
      { input: text, top: 0, left: 0 },
      { input: logo, top: 210, left: 80 },
    ]);

  // Save PNG (for maximum compatibility)
  await result.clone().png({ quality: 90 }).toFile(join(root, 'public/images/og-banner.png'));

  // Save WebP (smaller file)
  await result.clone().webp({ quality: 85 }).toFile(join(root, 'public/images/og-banner.webp'));

  console.log('Generated:');
  console.log('  public/images/og-banner.png');
  console.log('  public/images/og-banner.webp');

  // Print file sizes
  const pngMeta = await sharp(join(root, 'public/images/og-banner.png')).metadata();
  const webpMeta = await sharp(join(root, 'public/images/og-banner.webp')).metadata();
  console.log(`  PNG: ${pngMeta.width}x${pngMeta.height}`);
  console.log(`  WebP: ${webpMeta.width}x${webpMeta.height}`);
}

generate().catch(console.error);
