# SEO Reference — TLACU Landing Site

Guía para optimizar el SEO de cada página del sitio tlacu-landing (Astro).

---

## Convenciones generales

### Estructura base (Layout.astro)

Cada página usa `<Layout title="..." description="...">`. El layout ya incluye:

- `<meta charset="UTF-8">`
- `<meta name="viewport">`
- `<meta name="description">` (del prop `description`)
- `<meta http-equiv="content-language" content="es-MX">`
- `<meta name="geo.region" content="MX-MEX">`
- `<meta name="geo.placename" content="Ciudad de México">`
- Open Graph: `og:title`, `og:description`, `og:type`, `og:locale`, `og:site_name`, `og:image`, `og:image:width`, `og:image:height`
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `<slot name="head" />` para contenido SEO adicional por página

**Description por defecto** (si la página no pasa prop `description`):
> "TLACU - Plataforma educativa 100% responsiva que enciende el conocimiento"

### Dominio

- **Producción**: `https://tlacu.mx`
- **Desarrollo**: `https://landing-dev.tlacu.mx`

### Formato de títulos

Patrón recomendado: `{Página} — {Beneficio o contexto} | TLACU`

Ejemplos:
- `Flashcards ECOEMS — Repasa las 10 áreas con tarjetas inteligentes | TLACU`
- `Examen Diagnóstico — Identifica tus áreas débiles en 30 minutos | TLACU`

Máximo ~60 caracteres para evitar truncamiento en Google.

### Formato de descriptions

- Máximo 155 caracteres
- Incluir keyword principal + beneficio + call to action implícito
- En español mexicano correcto (acentos, ¿?, ¡!)
- Incluir "ECOEMS" en las páginas de producto

### Slot `head` — Contenido adicional por página

Cada página puede inyectar tags en el `<head>` usando:

```astro
<Fragment slot="head">
  <link rel="canonical" href="https://tlacu.mx/ruta" />
  <meta property="og:url" content="https://tlacu.mx/ruta" />
  <meta name="robots" content="index, follow" />
  <!-- JSON-LD aquí -->
</Fragment>
```

### Checklist por página

Para cada página, agregar:

1. **`description` prop** — Descripción SEO única (no usar el default)
2. **Canonical URL** — `<link rel="canonical" href="https://tlacu.mx/...">`
3. **`og:url`** — Misma URL que canonical
4. **`robots`** — `index, follow` para públicas; `noindex` para legales si se desea
5. **JSON-LD** — Schema.org apropiado (ver recomendaciones por página)

---

## Estado actual y recomendaciones por página

### Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Ya implementado |
| ❌ | Falta — hay que agregar |

---

### 1. `/` — Página principal (index.astro)

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `TLACU - Plataforma Educativa que Enciende el Conocimiento` |
| Description | ❌ | Agregar: `"Prepárate para el ECOEMS con exámenes de práctica, flashcards, módulos interactivos y plan de estudio personalizado. Regístrate gratis."` |
| Canonical | ❌ | `https://tlacu.mx/` |
| og:url | ❌ | `https://tlacu.mx/` |
| H1 | ✅ | "El fuego del conocimiento" |
| JSON-LD | ❌ | `WebSite` + `Organization` |

**Schema recomendado**: `WebSite` con `potentialAction: SearchAction` y `Organization` con logo, nombre, URL.

---

### 2. `/acerca` — Acerca de (acerca.astro)

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Acerca de TLACU - Plataforma Educativa` |
| Description | ❌ | Agregar: `"Conoce la misión de TLACU: democratizar la preparación para el ECOEMS con tecnología, ciencia del aprendizaje y contenido 100% enfocado en el examen."` |
| Canonical | ❌ | `https://tlacu.mx/acerca` |
| og:url | ❌ | `https://tlacu.mx/acerca` |
| H1 | ✅ | "El fuego del conocimiento" |
| JSON-LD | ❌ | `AboutPage` |

---

### 3. `/contacto` — Contacto (contacto.astro)

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Contacto - TLACU` |
| Description | ❌ | Agregar: `"¿Tienes dudas sobre TLACU o el ECOEMS? Contáctanos por correo o redes sociales. Estamos para ayudarte."` |
| Canonical | ❌ | `https://tlacu.mx/contacto` |
| og:url | ❌ | `https://tlacu.mx/contacto` |
| H1 | ✅ | "Contáctanos" |
| JSON-LD | ❌ | `ContactPage` |

---

### 4. `/examenes` — Hub de exámenes (examenes.astro)

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Exámenes de Práctica - TLACU ECOEMS` |
| Description | ❌ | Agregar: `"Practica con exámenes tipo ECOEMS: diagnóstico, rápido, completo y simulador con cámara. Retroalimentación inmediata en las 10 áreas."` |
| Canonical | ❌ | `https://tlacu.mx/examenes` |
| og:url | ❌ | `https://tlacu.mx/examenes` |
| H1 | ✅ | "Exámenes tipo ECOEMS" |
| JSON-LD | ❌ | `CollectionPage` |

---

### 5. `/examenes/diagnostico` — Examen diagnóstico

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Examen Diagnóstico - TLACU ECOEMS` |
| Description | ❌ | Agregar: `"Haz un examen diagnóstico gratuito de 64 preguntas que cubre las 10 áreas del ECOEMS. Identifica tus fortalezas y debilidades al instante."` |
| Canonical | ❌ | `https://tlacu.mx/examenes/diagnostico` |
| og:url | ❌ | `https://tlacu.mx/examenes/diagnostico` |
| H1 | ✅ | "Examen Diagnóstico" |
| JSON-LD | ❌ | `WebPage` con `educationalLevel` |

---

### 6. `/examenes/completo` — Examen completo

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Examen Completo - TLACU ECOEMS` |
| Description | ❌ | Agregar: `"Simula el examen ECOEMS completo: 128 preguntas, 10 áreas, tiempo limitado. Mide tu preparación real antes del día del examen."` |
| Canonical | ❌ | `https://tlacu.mx/examenes/completo` |
| og:url | ❌ | `https://tlacu.mx/examenes/completo` |
| H1 | ✅ | "Examen Completo" |
| JSON-LD | ❌ | `WebPage` |

---

### 7. `/examenes/rapido` — Examen rápido

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Examen Rápido - TLACU ECOEMS` |
| Description | ❌ | Agregar: `"Examen rápido de 20 preguntas ECOEMS para practicar en 15 minutos. Elige el área que quieras reforzar y recibe retroalimentación al instante."` |
| Canonical | ❌ | `https://tlacu.mx/examenes/rapido` |
| og:url | ❌ | `https://tlacu.mx/examenes/rapido` |
| H1 | ✅ | "Examen Rápido" |
| JSON-LD | ❌ | `WebPage` |

---

### 8. `/examenes/simulador` — Simulador con cámara

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Simulador con Cámara - TLACU ECOEMS` |
| Description | ❌ | Agregar: `"Practica el ECOEMS con cámara activa, detección de rostro, ruido y objetos. Simula las condiciones reales del examen desde casa."` |
| Canonical | ❌ | `https://tlacu.mx/examenes/simulador` |
| og:url | ❌ | `https://tlacu.mx/examenes/simulador` |
| H1 | ❌ | Verificar que exista un H1 visible |
| JSON-LD | ❌ | `WebPage` |

---

### 9. `/flashcards` — Flashcards (flashcards.astro)

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Flashcards ECOEMS — Repasa las 10 áreas con tarjetas inteligentes \| TLACU` |
| Description | ✅ | Ya tiene descripción personalizada |
| Canonical | ✅ | Ya implementado en slot head |
| og:url | ✅ | Ya implementado |
| H1 | ✅ | "Flashcards que se adaptan a ti" |
| JSON-LD | ❌ | `WebPage` con `learningResourceType: "flashcard"` |

---

### 10. `/practicar-preguntas` — Practicar preguntas

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Practicar preguntas ECOEMS — Estudia por área con retroalimentación \| TLACU` |
| Description | ✅ | Ya tiene descripción personalizada |
| Canonical | ✅ | Ya implementado |
| og:url | ✅ | Ya implementado |
| H1 | ✅ | "Practica preguntas a tu ritmo" |
| JSON-LD | ❌ | `WebPage` |

---

### 11. `/modulos` — Hub de módulos (modulos.astro)

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Módulos de Aprendizaje - TLACU ECOEMS` |
| Description | ❌ | Agregar: `"20 módulos de aprendizaje para el ECOEMS: tabla periódica, células, álgebra, geometría, comprensión lectora y más. Aprende de forma visual e interactiva."` |
| Canonical | ❌ | `https://tlacu.mx/modulos` |
| og:url | ❌ | `https://tlacu.mx/modulos` |
| H1 | ✅ | "Módulos de Aprendizaje" |
| JSON-LD | ❌ | `CollectionPage` |

---

### 12. `/modulos-interactivos` — Módulos interactivos

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Módulos Interactivos - Aprende con 3D y Simuladores - TLACU` |
| Description | ❌ | Agregar: `"11 módulos interactivos del temario ECOEMS: tabla periódica, explorador de células, álgebra, geometría y más. Aprende con herramientas visuales."` |
| Canonical | ❌ | `https://tlacu.mx/modulos-interactivos` |
| og:url | ❌ | `https://tlacu.mx/modulos-interactivos` |
| H1 | ✅ | Verificar (probablemente en sección hero) |
| JSON-LD | ❌ | `CollectionPage` con `hasPart` listando módulos |

---

### 13. `/modulos/refuerzo` — Módulos de refuerzo

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Módulos de Refuerzo - TLACU ECOEMS` |
| Description | ❌ | Agregar: `"9 módulos de refuerzo para fortalecer tus bases: fracciones, aritmética, ortografía, comprensión lectora y más. Gratis para comenzar."` |
| Canonical | ❌ | `https://tlacu.mx/modulos/refuerzo` |
| og:url | ❌ | `https://tlacu.mx/modulos/refuerzo` |
| H1 | ✅ | "Módulos de Refuerzo" |
| JSON-LD | ❌ | `CollectionPage` |

---

### 14. `/plan-estudio` — Plan de estudio personalizado

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Plan de Estudio Personalizado - TLACU ECOEMS` |
| Description | ❌ | Agregar: `"Genera un plan de estudio personalizado para el ECOEMS basado en tu diagnóstico. Calendario día a día con actividades balanceadas."` |
| Canonical | ❌ | `https://tlacu.mx/plan-estudio` |
| og:url | ❌ | `https://tlacu.mx/plan-estudio` |
| H1 | ✅ | "Tu plan de estudio personalizado" |
| JSON-LD | ❌ | `WebPage` |

---

### 15. `/plataforma` — La plataforma

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `La Plataforma - TLACU ECOEMS` |
| Description | ❌ | Agregar: `"Conoce todas las herramientas de TLACU: exámenes, flashcards, 20 módulos, plan de estudio, repaso espaciado y simulador con cámara para el ECOEMS."` |
| Canonical | ❌ | `https://tlacu.mx/plataforma` |
| og:url | ❌ | `https://tlacu.mx/plataforma` |
| H1 | ✅ | "Una plataforma diseñada para el ECOEMS" |
| JSON-LD | ❌ | `WebPage` o `SoftwareApplication` |

---

### 16. `/precios` — Precios

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Precios - TLACU ECOEMS` |
| Description | ❌ | Agregar: `"Pago único por 1 año de acceso Pro a TLACU. Sin suscripciones ni cargos ocultos. Plan gratuito disponible para comenzar a estudiar hoy."` |
| Canonical | ❌ | `https://tlacu.mx/precios` |
| og:url | ❌ | `https://tlacu.mx/precios` |
| H1 | ✅ | "Educación de calidad a un precio accesible" |
| JSON-LD | ❌ | `Product` con `Offer` (precio, moneda MXN) |

**Nota**: Esta página es clave para conversión. El schema `Product` + `Offer` puede generar rich snippets con precio en Google.

---

### 17. `/por-que-tlacu` — ¿Por qué TLACU?

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `¿Por qué TLACU? - Compara y Decide \| TLACU` |
| Description | ❌ | Agregar: `"Compara TLACU con otras opciones de preparación para el ECOEMS. Enfoque 100% ECOEMS, ciencia del aprendizaje y precio justo."` |
| Canonical | ❌ | `https://tlacu.mx/por-que-tlacu` |
| og:url | ❌ | `https://tlacu.mx/por-que-tlacu` |
| H1 | ✅ | Dinámico según comparación seleccionada |
| JSON-LD | ❌ | `WebPage` |

---

### 18. `/que-es-ecoems` — ¿Qué es el ECOEMS?

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | Variable SEO personalizada |
| Description | ✅ | Variable SEO personalizada |
| Canonical | ✅ | Ya implementado |
| og:url | ✅ | Ya implementado |
| robots | ✅ | `index, follow` |
| H1 | ✅ | Variable SEO |
| JSON-LD | ✅ | `FAQPage`, `BreadcrumbList`, `WebPage` |

**Esta página es el modelo a seguir para las demás.** Tiene la implementación SEO más completa.

---

### 19. `/para-padres` — Panel para padres

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Panel para Padres y Tutores - Monitorea el progreso de tus hijos - TLACU` |
| Description | ✅ | Ya tiene descripción personalizada |
| Canonical | ✅ | Ya implementado |
| og:url | ✅ | Ya implementado |
| H1 | ✅ | "Monitorea el progreso de tus hijos o alumnos" |
| JSON-LD | ❌ | `WebPage` |

---

### 20. `/repaso-espaciado` — Repaso espaciado

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Repaso Espaciado con SM-2 \| Ciencia detrás de TLACU` |
| Description | ✅ | `"Descubre cómo el algoritmo SM-2 de repetición espaciada funciona en el modo Repaso y las Flashcards de TLACU para maximizar tu retención antes del ECOEMS."` |
| Canonical | ❌ | `https://tlacu.mx/repaso-espaciado` |
| og:url | ❌ | `https://tlacu.mx/repaso-espaciado` |
| H1 | ✅ | Verificar |
| JSON-LD | ❌ | `Article` o `WebPage` (contenido educativo sobre SM-2) |

---

### 21. `/recursos` — Recursos y tips

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Recursos y Tips de Estudio - TLACU` |
| Description | ❌ | Agregar: `"Tips de estudio, técnicas de memorización y recursos gratuitos para prepararte para el ECOEMS. Artículos y guías prácticas."` |
| Canonical | ❌ | `https://tlacu.mx/recursos` |
| og:url | ❌ | `https://tlacu.mx/recursos` |
| H1 | ✅ | Verificar |
| JSON-LD | ❌ | `CollectionPage` o `Blog` |

---

### 22. `/hoja-de-ruta` — Hoja de ruta (roadmap)

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Hoja de Ruta — Lo que viene en TLACU \| TLACU` |
| Description | ❌ | Agregar: `"Conoce las funciones lanzadas y lo que viene en TLACU: nuevos módulos, herramientas y mejoras para tu preparación ECOEMS."` |
| Canonical | ❌ | `https://tlacu.mx/hoja-de-ruta` |
| og:url | ❌ | `https://tlacu.mx/hoja-de-ruta` |
| H1 | ✅ | "Hoja de ruta" |
| JSON-LD | ❌ | `WebPage` |

---

### 23. `/privacidad` — Política de privacidad

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Política de Privacidad - TLACU` |
| Description | ❌ | Agregar: `"Política de privacidad de TLACU. Conoce cómo recopilamos, usamos y protegemos tu información personal."` |
| Canonical | ❌ | `https://tlacu.mx/privacidad` |
| og:url | ❌ | `https://tlacu.mx/privacidad` |
| H1 | ✅ | "Política de Privacidad" |
| JSON-LD | ❌ | Opcional |
| robots | ❌ | Considerar `noindex, follow` |

---

### 24. `/terminos` — Términos de servicio

| Elemento | Estado | Valor actual / Recomendación |
|----------|--------|------------------------------|
| Title | ✅ | `Términos de Servicio - TLACU` |
| Description | ❌ | Agregar: `"Términos de servicio de TLACU. Condiciones de uso de la plataforma educativa para preparación del ECOEMS."` |
| Canonical | ❌ | `https://tlacu.mx/terminos` |
| og:url | ❌ | `https://tlacu.mx/terminos` |
| H1 | ✅ | "Términos de Servicio" |
| JSON-LD | ❌ | Opcional |
| robots | ❌ | Considerar `noindex, follow` |

---

## Schemas JSON-LD recomendados

### Página principal (`/`) — WebSite + Organization

```json
[
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TLACU",
    "url": "https://tlacu.mx",
    "description": "Plataforma educativa para preparación del ECOEMS",
    "inLanguage": "es-MX"
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TLACU",
    "url": "https://tlacu.mx",
    "logo": "https://tlacu.mx/images/logos/logo-tlacu-color.webp",
    "sameAs": []
  }
]
```

### Precios (`/precios`) — Product + Offer

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "TLACU Pro — Preparación ECOEMS",
  "description": "Acceso completo por 1 año a todos los exámenes, flashcards, módulos y plan de estudio personalizado.",
  "brand": { "@type": "Brand", "name": "TLACU" },
  "offers": {
    "@type": "Offer",
    "price": "PRECIO_ACTUAL",
    "priceCurrency": "MXN",
    "availability": "https://schema.org/InStock",
    "url": "https://tlacu.mx/precios"
  }
}
```

### Páginas con FAQ — FAQPage

Ya implementado en `/que-es-ecoems`. Replicar patrón en páginas que tengan secciones de preguntas frecuentes.

### Páginas de colección — CollectionPage

Para `/examenes`, `/modulos`, `/modulos-interactivos`, `/modulos/refuerzo`:

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Nombre de la colección",
  "description": "Descripción",
  "url": "https://tlacu.mx/ruta",
  "isPartOf": { "@type": "WebSite", "name": "TLACU", "url": "https://tlacu.mx" }
}
```

### BreadcrumbList

Para páginas anidadas (`/examenes/*`, `/modulos/*`):

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tlacu.mx/" },
    { "@type": "ListItem", "position": 2, "name": "Exámenes", "item": "https://tlacu.mx/examenes" },
    { "@type": "ListItem", "position": 3, "name": "Diagnóstico", "item": "https://tlacu.mx/examenes/diagnostico" }
  ]
}
```

---

## Resumen de prioridades

### Alta prioridad (páginas de producto/conversión)

| Página | Falta |
|--------|-------|
| `/` (index) | description, canonical, og:url, JSON-LD (WebSite + Organization) |
| `/precios` | description, canonical, og:url, JSON-LD (Product + Offer) |
| `/plataforma` | description, canonical, og:url |
| `/examenes` | description, canonical, og:url, JSON-LD (CollectionPage) |
| `/examenes/diagnostico` | description, canonical, og:url |
| `/modulos` | description, canonical, og:url |
| `/modulos-interactivos` | description, canonical, og:url |

### Media prioridad (páginas informativas)

| Página | Falta |
|--------|-------|
| `/por-que-tlacu` | description, canonical, og:url |
| `/para-padres` | JSON-LD |
| `/plan-estudio` | description, canonical, og:url |
| `/repaso-espaciado` | canonical, og:url |
| `/recursos` | description, canonical, og:url |
| `/examenes/completo` | description, canonical, og:url |
| `/examenes/rapido` | description, canonical, og:url |
| `/examenes/simulador` | description, canonical, og:url |
| `/modulos/refuerzo` | description, canonical, og:url |

### Baja prioridad

| Página | Falta |
|--------|-------|
| `/acerca` | description, canonical, og:url |
| `/contacto` | description, canonical, og:url |
| `/hoja-de-ruta` | description, canonical, og:url |
| `/privacidad` | description, canonical, considerar noindex |
| `/terminos` | description, canonical, considerar noindex |

### Ya optimizadas (modelo a seguir)

| Página | Estado |
|--------|--------|
| `/que-es-ecoems` | ✅ Completa (title, description, canonical, og:url, robots, 3 JSON-LD) |
| `/flashcards` | ✅ Casi completa (falta JSON-LD) |
| `/practicar-preguntas` | ✅ Casi completa (falta JSON-LD) |

---

## Notas adicionales

- **Sitemap**: Verificar que Astro genera `sitemap.xml` (requiere `@astrojs/sitemap` integration)
- **robots.txt**: Verificar existencia y que apunte al sitemap
- **Imágenes OG**: Actualmente todas las páginas usan `/images/og-banner.png` (1200x630). Considerar imágenes OG específicas para páginas clave
- **Hreflang**: No necesario por ahora (solo es-MX), pero tenerlo en cuenta si se agrega inglés
- **Performance**: Verificar Core Web Vitals, especialmente LCP en páginas con imágenes grandes
- **Ortografía**: Toda description y title debe respetar las reglas de español mexicano del CLAUDE.md (acentos, ¿?, ¡!, ñ)
