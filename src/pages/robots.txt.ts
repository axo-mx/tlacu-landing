import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const isDev = url.hostname.includes('dev');

  const body = isDev
    ? `User-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\n\nSitemap: https://tlacu.mx/sitemap-index.xml\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
