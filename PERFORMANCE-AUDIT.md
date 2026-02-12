# Performance Audit - tlacu-landing

**Fecha:** 2026-02-10
**Basado en:** [Frontend Performance Checklist - roadmap.sh](https://roadmap.sh/best-practices/frontend-performance)

---

## Estado Actual (POST-OPTIMIZACIÓN)

- **Peso total dist:** ~4.2MB (antes: 13MB, -68%)
- **Imágenes:** ~0.9MB (antes: 9.7MB, -91% gracias a WebP)
- **Modelos 3D:** ~1.4MB (sin cambios, necesarios para demo)
- **JS Three.js bundle:** ~1MB (solo se carga en /modulos)

---

## HIGH PRIORITY

| Check | Estado | Acción |
|-------|--------|--------|
| Page weight < 1500KB | ⚠️ | 4.2MB total (1.4MB son modelos 3D para demo) |
| Page load time < 3s | ⚠️ | Depende de optimizaciones |
| GZIP/Brotli enabled | ⚠️ | Configurar en servidor |
| Minimize HTTP Requests | ⚠️ | Self-host fonts |
| Compress images | ✅ | WebP con 82% quality, resize automático |
| HTTP cache headers | ⚠️ | Configurar en servidor |
| TTFB < 1.3s | ⚠️ | Configurar en servidor |
| Non-blocking JS | ✅ | Astro lo maneja |
| Minify JavaScript | ✅ | Vite minifica |
| Minified CSS | ✅ | Tailwind purga |
| Inline Critical CSS | ⚠️ | Considerar para above-fold |
| CSS non-blocking | ✅ | OK |
| Use HTTPS | ⚠️ | Servidor |
| Image format | ✅ | Todas las imágenes convertidas a WebP |
| Avoid 404s | ✅ | og:image usa logo webp existente |
| Same protocol | ✅ | OK |
| Minimize iframes | ✅ | No hay |
| Avoid inline CSS | ⚠️ | Hay algunos `<style>` |
| CSS complexity | ⚠️ | Muchas animaciones |

## MEDIUM PRIORITY

| Check | Estado | Acción |
|-------|--------|--------|
| Minified HTML | ✅ | Astro lo hace |
| Use CDN | ⚠️ | Configurar |
| Vector > bitmap | ⚠️ | Logos en WebP (~10KB), SVG opcional |
| width/height on images | ✅ | Agregado a todas las imágenes |
| Avoid Base64 | ✅ | OK |
| Lazy load images | ✅ | loading="lazy" en imágenes below-fold |
| Image size = display size | ✅ | Redimensionadas a max 1200px |
| Avoid inline scripts | ⚠️ | PostHog, CookieBanner |
| Dependencies updated | ✅ | OK |
| JS performance | ⚠️ | Three.js muy pesado |
| Service Workers | ⏭️ | No implementar (decisión) |
| Cookie size < 4KB | ✅ | Cookieless |
| Cookie count < 20 | ✅ | Cookieless |

## LOW PRIORITY

| Check | Estado | Acción |
|-------|--------|--------|
| Preload URLs | ✅ | Preload agregado para logo crítico |
| Concatenate CSS | ✅ | Astro lo hace |
| Remove unused CSS | ✅ | Tailwind purga |
| WOFF2 fonts | ⚠️ | Google Fonts mixto |
| Preconnect fonts | ✅ | Ya tiene |
| Font size < 300kb | ⚠️ | Reducir pesos |
| Prevent FOIT/FOUT | ⚠️ | display=swap ayuda |
| Dependencies size | ❌ | Three.js muy pesado |

---

## Plan de Correcciones

### Fase 1 - Crítico (COMPLETADO 2026-02-10)
- [x] Crear archivo de auditoría
- [x] Convertir imágenes PNG a WebP (91% reducción)
- [x] Agregar width/height a todas las `<img>`
- [x] Agregar loading="lazy" a imágenes offscreen
- [x] Arreglar referencia og:image (usar logo webp)
- [x] Agregar preload para logo crítico

### Fase 2 - Alto (PENDIENTE)
- [ ] Convertir logos PNG a SVG (opcional, webp ya es pequeño)
- [ ] Self-host fonts (o reducir pesos)
- [ ] Code-split Three.js (ya está solo en /modulos via client:only)

### Fase 3 - Medio (PENDIENTE)
- [ ] Optimizar animaciones CSS (reduce will-change)
- [ ] Configurar CDN (deployment config)
- [ ] Considerar astro:assets para optimización automática

---

## Comandos Útiles

```bash
# Convertir PNG a WebP (requiere cwebp)
for f in public/images/**/*.png; do cwebp -q 80 "$f" -o "${f%.png}.webp"; done

# Verificar tamaños
du -sh public/images/*

# Build y analizar
npm run build && du -sh dist/
```

---

## Referencias

- [web.dev/performance](https://web.dev/performance/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
