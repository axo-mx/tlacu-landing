import type { APIContext } from 'astro';

export const prerender = false;

// PostHog server-side capture (fire-and-forget)
const POSTHOG_KEY = import.meta.env.PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.PUBLIC_POSTHOG_HOST;

function trackServer(event: string, ip: string, props?: Record<string, unknown>) {
  if (!POSTHOG_KEY || !POSTHOG_HOST) return;
  // Non-blocking — don't await
  fetch(`${POSTHOG_HOST}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      event,
      distinct_id: `server-${ip}`,
      properties: {
        ...props,
        $ip: ip,
        site: 'landing',
        environment: POSTHOG_HOST.includes('dev') ? 'dev' : 'prod',
      },
    }),
  }).catch(() => {}); // Silently ignore errors
}

// Simple in-memory rate limiting (per Worker isolate)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 3; // max 3 submissions per window

const REASON_LABELS: Record<string, string> = {
  general: 'Pregunta general',
  support: 'Soporte técnico',
  partnership: 'Alianzas y colaboraciones',
  feedback: 'Sugerencias y comentarios',
  schools: 'Escuelas e instituciones',
};

function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(context: APIContext) {
  const { request } = context;
  try {
    const ip = getClientIp(request);

    // Rate limit
    if (isRateLimited(ip)) {
      trackServer('contact_bot_rate_limited', ip, {
        blocked_by: 'rate_limit',
      });
      return new Response(
        JSON.stringify({ error: 'Demasiados mensajes. Intenta de nuevo en un minuto.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { name, email, reason, subject, message, _hp, _t } = body;

    // Honeypot check — if bot filled the hidden field, silently succeed
    if (_hp) {
      trackServer('contact_bot_blocked', ip, {
        blocked_by: 'honeypot',
        honeypot_value: String(_hp).slice(0, 100),
      });
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Time-based check — reject if submitted in under 3 seconds
    const formLoadTime = Number(_t);
    const submitSpeed = formLoadTime ? Date.now() - formLoadTime : 0;
    if (!formLoadTime || submitSpeed < 3000) {
      trackServer('contact_bot_blocked', ip, {
        blocked_by: 'too_fast',
        submit_speed_ms: submitSpeed,
      });
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !reason?.trim() || !subject?.trim() || !message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos son obligatorios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'El correo electrónico no es válido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get Resend API key from Cloudflare Worker environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cfEnv = (context.locals as any).runtime?.env || {};
    const resendApiKey: string | undefined = cfEnv.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('[contact] RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Error de configuración del servidor.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reasonLabel = REASON_LABELS[reason] || reason;

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TLACU Contacto <contacto@tlacu.mx>',
        to: ['hola@tlacu.mx'],
        reply_to: email.trim(),
        subject: `[${reasonLabel}] ${subject.trim()}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a2744; padding: 24px; border-radius: 12px 12px 0 0;">
              <h1 style="color: #41c9b4; margin: 0; font-size: 20px;">Nuevo mensaje de contacto</h1>
            </div>
            <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px; vertical-align: top;">Nombre:</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600;">${escapeHtml(name.trim())}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Email:</td>
                  <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${escapeHtml(email.trim())}" style="color: #41c9b4;">${escapeHtml(email.trim())}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Motivo:</td>
                  <td style="padding: 8px 0; font-size: 14px;">${escapeHtml(reasonLabel)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Asunto:</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600;">${escapeHtml(subject.trim())}</td>
                </tr>
              </table>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
              <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message.trim())}</div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">IP: ${escapeHtml(ip)} · ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
            </div>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error('[contact] Resend error:', resendResponse.status, errorData);
      trackServer('contact_email_failed', ip, {
        reason: reason?.trim(),
        resend_status: resendResponse.status,
      });
      return new Response(
        JSON.stringify({ error: 'No se pudo enviar el mensaje. Intenta de nuevo más tarde.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    trackServer('contact_email_sent', ip, {
      reason: reason?.trim(),
      submit_speed_ms: submitSpeed,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[contact] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Reject other methods
export function ALL() {
  return new Response(
    JSON.stringify({ error: 'Método no permitido' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}
