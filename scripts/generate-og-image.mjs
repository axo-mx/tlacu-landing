import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath, URL } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'public/images/og');

mkdirSync(outDir, { recursive: true });

// OG image dimensions
const WIDTH = 1200;
const HEIGHT = 630;

// Brand colors (from landing hero)
const NAVY = '#364c6b';
const NAVY_DARK = '#253545';
const VERY_DARK = '#1a2634';
const TERRACOTTA = '#c4613a';
const TURQUOISE = '#3a9d9b';

// All pages data
const pages = [
  { slug: 'inicio', title: 'Plataforma de estudio\nECOEMS 2026', subtitle: 'Exámenes, flashcards, módulos y plan de estudio' },
  { slug: 'acerca', title: 'Nuestra misión y equipo', subtitle: 'Democratizar la preparación para el ECOEMS' },
  { slug: 'contacto', title: 'Contacto', subtitle: '¿Dudas sobre TLACU o el ECOEMS?' },
  { slug: 'plataforma', title: 'Todas las herramientas\nECOEMS', subtitle: 'Exámenes, flashcards, módulos y simulador' },
  { slug: 'precios', title: 'Precios — Plan Gratuito\ny Pro', subtitle: 'Pago único por 1 año de acceso' },
  { slug: 'que-es-ecoems', title: '¿Qué es el ECOEMS?', subtitle: '128 preguntas · 10 áreas · 3 horas · en línea' },
  { slug: 'por-que-tlacu', title: '¿Por qué TLACU?', subtitle: 'Compara opciones de preparación ECOEMS' },
  { slug: 'hoja-de-ruta', title: 'Hoja de Ruta', subtitle: 'Lo que viene en TLACU' },
  { slug: 'para-padres', title: 'Panel para Padres\ny Tutores', subtitle: 'Monitorea el progreso de tus hijos' },
  { slug: 'plan-estudio', title: 'Plan de Estudio\nPersonalizado', subtitle: 'Calendario día a día basado en tu diagnóstico' },
  { slug: 'practicar-preguntas', title: 'Practicar Preguntas\nECOEMS', subtitle: 'Estudia por área con retroalimentación' },
  { slug: 'flashcards', title: 'Flashcards ECOEMS', subtitle: 'Tarjetas inteligentes con repetición espaciada' },
  { slug: 'repaso-espaciado', title: 'Repetición Espaciada\nSM-2', subtitle: 'Algoritmo inteligente de memorización' },
  { slug: 'modulos-interactivos', title: 'Módulos Interactivos', subtitle: '3D, simuladores y herramientas visuales' },
  { slug: 'modulos', title: 'Módulos de Aprendizaje', subtitle: 'Interactivos y de refuerzo' },
  { slug: 'modulos-refuerzo', title: 'Módulos de Refuerzo', subtitle: 'Fortalece tus bases para el ECOEMS' },
  { slug: 'examenes', title: 'Exámenes de Práctica', subtitle: 'Diagnóstico, rápido, completo y simulador' },
  { slug: 'examenes-completo', title: 'Examen Completo\nECOEMS', subtitle: '128 preguntas en condiciones reales' },
  { slug: 'examenes-diagnostico', title: 'Examen Diagnóstico\nECOEMS', subtitle: 'Identifica tus áreas débiles' },
  { slug: 'examenes-rapido', title: 'Examen Rápido ECOEMS', subtitle: 'Practica en 15 minutos' },
  { slug: 'examenes-simulador', title: 'Simulador ECOEMS\ncon Cámara', subtitle: 'Practica en condiciones reales' },
  { slug: 'privacidad', title: 'Política de Privacidad', subtitle: '' },
  { slug: 'terminos', title: 'Términos de Servicio', subtitle: '' },
  { slug: 'recursos', title: 'Recursos y Tips\nde Estudio', subtitle: 'Tips, técnicas y guías para el ECOEMS' },
];

// Generate scattered dots (inspired by landing's floating dots)
function generateDots(count, seed) {
  let dots = '';
  // Pseudo-random based on seed for reproducibility
  let s = seed;
  const rand = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };

  for (let i = 0; i < count; i++) {
    const x = 100 + rand() * (WIDTH - 200);
    const y = 80 + rand() * (HEIGHT - 160);
    const r = 1.5 + rand() * 2.5;
    const opacity = 0.15 + rand() * 0.35;
    const color = rand() > 0.5 ? TURQUOISE : 'white';
    dots += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}"/>`;
  }
  return dots;
}

// Build background SVG inspired by the landing hero
function buildBackgroundSvg(seed) {
  const dots = generateDots(25, seed);

  return `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Hero gradient matching landing -->
    <linearGradient id="hero" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${NAVY}"/>
      <stop offset="50%" stop-color="${NAVY_DARK}"/>
      <stop offset="100%" stop-color="${VERY_DARK}"/>
    </linearGradient>

    <!-- Glow circles like landing -->
    <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${TERRACOTTA}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${TERRACOTTA}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${TURQUOISE}" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="${TURQUOISE}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow3" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${TURQUOISE}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${TURQUOISE}" stop-opacity="0"/>
    </radialGradient>

    <!-- Grid pattern (cuadrícula from landing) -->
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" stroke-width="0.4" opacity="0.07"/>
    </pattern>

    <!-- Horizontal line glow for terracotta -->
    <linearGradient id="lineGlowTC" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${TERRACOTTA}" stop-opacity="0"/>
      <stop offset="20%" stop-color="${TERRACOTTA}" stop-opacity="0.6"/>
      <stop offset="80%" stop-color="${TERRACOTTA}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${TERRACOTTA}" stop-opacity="0"/>
    </linearGradient>
    <!-- Horizontal line glow for turquoise -->
    <linearGradient id="lineGlowTQ" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${TURQUOISE}" stop-opacity="0"/>
      <stop offset="15%" stop-color="${TURQUOISE}" stop-opacity="0.5"/>
      <stop offset="85%" stop-color="${TURQUOISE}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${TURQUOISE}" stop-opacity="0"/>
    </linearGradient>

    <!-- Glow blur for horizontal lines -->
    <filter id="lineBlur">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
    <filter id="lineBlurWide">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>

  <!-- Base gradient background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#hero)"/>

  <!-- Grid overlay (cuadrícula) -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)"/>

  <!-- Decorative glow orbs -->
  <ellipse cx="950" cy="150" rx="350" ry="300" fill="url(#glow1)"/>
  <ellipse cx="180" cy="480" rx="280" ry="240" fill="url(#glow2)"/>
  <ellipse cx="600" cy="315" rx="200" ry="180" fill="url(#glow3)"/>

  <!-- Dashed circle (like tlacuache halo in landing) -->
  <circle cx="980" cy="340" r="180" fill="none" stroke="${TURQUOISE}" stroke-width="1" stroke-dasharray="8 12" opacity="0.12"/>
  <circle cx="980" cy="340" r="220" fill="none" stroke="${TURQUOISE}" stroke-width="0.5" stroke-dasharray="4 16" opacity="0.07"/>

  <!-- Horizontal glowing lines (like the landing hero) -->
  <!-- Terracotta line -->
  <line x1="0" y1="195" x2="${WIDTH}" y2="195" stroke="url(#lineGlowTC)" stroke-width="1.5" filter="url(#lineBlur)"/>
  <line x1="0" y1="195" x2="${WIDTH}" y2="195" stroke="url(#lineGlowTC)" stroke-width="8" filter="url(#lineBlurWide)" opacity="0.3"/>
  <!-- Turquoise line -->
  <line x1="0" y1="525" x2="${WIDTH}" y2="525" stroke="url(#lineGlowTQ)" stroke-width="1.5" filter="url(#lineBlur)"/>
  <line x1="0" y1="525" x2="${WIDTH}" y2="525" stroke="url(#lineGlowTQ)" stroke-width="8" filter="url(#lineBlurWide)" opacity="0.25"/>

  <!-- Scattered floating dots -->
  ${dots}

  <!-- Terracotta accent bar at top -->
  <rect x="0" y="0" width="${WIDTH}" height="5" fill="${TERRACOTTA}"/>

  <!-- Bottom bar -->
  <rect x="0" y="${HEIGHT - 56}" width="${WIDTH}" height="56" fill="${VERY_DARK}" opacity="0.6"/>
  <line x1="80" y1="${HEIGHT - 56}" x2="${WIDTH - 80}" y2="${HEIGHT - 56}" stroke="white" stroke-width="0.5" opacity="0.12"/>
</svg>`;
}

// Build text overlay SVG
function buildTextSvg(title, subtitle) {
  const lines = title.split('\n');
  // Logo sits at y=120..176 (56px tall). Title starts well below it.
  const startY = lines.length > 1 ? 280 : 320;
  const lineHeight = 64;

  let titleSvg = '';
  for (let i = 0; i < lines.length; i++) {
    titleSvg += `<text x="80" y="${startY + i * lineHeight}" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="900" fill="white" letter-spacing="-1">${escapeXml(lines[i])}</text>`;
  }

  const subtitleY = startY + lines.length * lineHeight + 20;

  let subtitleSvg = '';
  if (subtitle) {
    subtitleSvg = `<text x="80" y="${subtitleY}" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="white" opacity="0.6">${escapeXml(subtitle)}</text>`;
  }

  return `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  ${titleSvg}
  ${subtitleSvg}

  <!-- URL bottom left -->
  <text x="80" y="${HEIGHT - 22}" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="${TURQUOISE}" letter-spacing="1">
    tlacu.mx
  </text>

  <!-- ECOEMS 2026 badge bottom right -->
  <text x="${WIDTH - 80}" y="${HEIGHT - 22}" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="white" opacity="0.4" text-anchor="end" letter-spacing="2">
    ECOEMS 2026
  </text>
</svg>`;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generate() {
  // Load and resize logo
  const logo = await sharp(join(root, 'public/images/logos/logo-tlacu-light.webp'))
    .resize({ height: 56 })
    .toBuffer();

  console.log(`Generating ${pages.length} OG images...\n`);

  for (const page of pages) {
    // Use slug hash as seed for reproducible dot placement
    const seed = page.slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 1) * 7919;

    const bgSvg = buildBackgroundSvg(seed);
    const txtSvg = buildTextSvg(page.title, page.subtitle);

    const background = await sharp(Buffer.from(bgSvg)).png().toBuffer();
    const text = await sharp(Buffer.from(txtSvg)).png().toBuffer();

    const outPath = join(outDir, `og-${page.slug}.png`);

    await sharp(background)
      .composite([
        { input: text, top: 0, left: 0 },
        { input: logo, top: 130, left: 80 },
      ])
      .png({ quality: 90 })
      .toFile(outPath);

    console.log(`  ✓ og-${page.slug}.png`);
  }

  // Also generate the generic fallback banner
  const fallbackBg = buildBackgroundSvg(42);
  const fallbackTxt = buildTextSvg('Prepárate para el\nECOEMS', 'Exámenes, flashcards, módulos interactivos y plan de estudio');

  const bg = await sharp(Buffer.from(fallbackBg)).png().toBuffer();
  const txt = await sharp(Buffer.from(fallbackTxt)).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: txt, top: 0, left: 0 },
      { input: logo, top: 130, left: 80 },
    ])
    .png({ quality: 90 })
    .toFile(join(root, 'public/images/og-banner.png'));

  console.log(`  ✓ og-banner.png (fallback)`);
  console.log(`\nDone! ${pages.length + 1} images generated.`);
}

generate().catch(console.error);
