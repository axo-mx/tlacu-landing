# TLACU Landing

Landing page para TLACU - plataforma de preparacion para el examen ECOEMS. Construida con Astro.

## Repositorios del Proyecto

| Repo | Descripcion | URL |
|------|-------------|-----|
| tlacu-infra | Infraestructura, DB, migraciones | [github.com/axo-mx/tlacu-infra](https://github.com/axo-mx/tlacu-infra) |
| tlacu-platform | App React (plataforma principal) | [github.com/axo-mx/tlacu-platform](https://github.com/axo-mx/tlacu-platform) |
| **tlacu-landing** | Landing page Astro | [github.com/servandoAxo/tlacu-landing](https://github.com/servandoAxo/tlacu-landing) |

## Estrategia de Branches

| Branch | Ambiente | URL |
|--------|----------|-----|
| `main` | DEV | https://dev.tlacu.mx |
| `prod` | PROD | https://tlacu.mx |

## Tech Stack

- **Framework**: Astro
- **Styling**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Deploy**: Cloudflare Pages

## Requisitos

- Node.js 20+
- npm

## Inicio Rapido

### 1. Clonar

```bash
git clone git@github.com:servandoAxo/tlacu-landing.git
cd tlacu-landing
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abrir http://localhost:4321

## Scripts

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (localhost:4321) |
| `npm run build` | Build de produccion |
| `npm run preview` | Preview del build local |
| `npm run astro` | Comandos CLI de Astro |

## Estructura del Proyecto

```
tlacu-landing/
├── src/
│   ├── components/        # Componentes Astro/React
│   │   ├── Hero.astro
│   │   ├── Features.astro
│   │   ├── Pricing.astro
│   │   └── ...
│   ├── layouts/           # Layouts base
│   │   └── Layout.astro
│   ├── pages/             # Paginas (rutas)
│   │   ├── index.astro    # Homepage
│   │   ├── precios.astro
│   │   └── ...
│   └── styles/            # Estilos globales
├── public/                # Assets estaticos
│   ├── images/
│   ├── fonts/
│   └── favicon.svg
└── astro.config.mjs
```

## Secciones de la Landing

- **Hero**: Presentacion principal con CTA
- **Features**: Caracteristicas de la plataforma
- **Areas**: Areas del examen ECOEMS
- **Testimonios**: Reviews de usuarios
- **Pricing**: Planes y precios
- **FAQ**: Preguntas frecuentes
- **CTA Final**: Call to action de cierre

## Deploy

### Cloudflare Pages (automatico)

Push a `main` → Deploy a DEV (dev.tlacu.mx)
Push a `prod` → Deploy a PROD (tlacu.mx)

### Build manual

```bash
npm run build
# Output en dist/
```

## Desarrollo

### Agregar nueva pagina

1. Crear archivo `.astro` en `src/pages/`
2. Usar el layout base:

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Mi Pagina">
  <main>
    <!-- Contenido -->
  </main>
</Layout>
```

### Agregar componente

1. Crear en `src/components/`
2. Importar donde se necesite:

```astro
---
import MiComponente from '../components/MiComponente.astro';
---

<MiComponente />
```

### Usar componentes React

Astro soporta componentes React con hidratacion:

```astro
---
import MiReactComponent from '../components/MiReactComponent.tsx';
---

<!-- Solo en servidor -->
<MiReactComponent />

<!-- Con hidratacion en cliente -->
<MiReactComponent client:load />
```

## Assets

- **Imagenes**: Colocar en `public/images/`
- **Fuentes**: Colocar en `public/fonts/`
- **SVGs**: Pueden ir en `src/components/` como componentes

## Optimizacion

Astro genera HTML estatico por defecto. Para mejor performance:

- Usar `<Image />` de Astro para optimizacion automatica
- Minimizar JavaScript del cliente
- Usar `client:visible` para componentes below the fold

## Links Importantes

- Plataforma DEV: https://app-dev.tlacu.mx
- Plataforma PROD: https://app.tlacu.mx
- Documentacion Astro: https://docs.astro.build
