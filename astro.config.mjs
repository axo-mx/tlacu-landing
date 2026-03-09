// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://tlacu.mx',

  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/privacidad') && !page.includes('/terminos') && !page.includes('/recursos'),
      changefreq: 'weekly',
      lastmod: new Date(),
      priority: 0.7,
      serialize(item) {
        // Higher priority for key pages
        if (item.url === 'https://tlacu.mx/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else if (
          item.url.includes('/examenes/') ||
          item.url.endsWith('/plataforma/') ||
          item.url.endsWith('/precios/')
        ) {
          item.priority = 0.9;
        } else if (
          item.url.endsWith('/examenes/') ||
          item.url.endsWith('/que-es-ecoems/') ||
          item.url.endsWith('/para-padres/') ||
          item.url.endsWith('/flashcards/') ||
          item.url.endsWith('/plan-estudio/')
        ) {
          item.priority = 0.8;
        }
        return item;
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: cloudflare()
});