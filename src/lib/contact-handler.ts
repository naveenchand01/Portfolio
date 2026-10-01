import {
  type ContactMessage,
  contactSchema,
  fieldErrors,
  MAX_BODY_BYTES,
  MIN_FILL_MS,
} from './contact-schema';

export type ContactDeps = {
  /** Sends the email. Throws on failure. Null when the backend isn't configured. */
  send: ((msg: ContactMessage, meta: { page: string }) => Promise<void>) | null;
  allow: (ip: string) => boolean;
  now?: () => number;
};

const json = (status: number, body: Record<string, unknown>) => Response.json(body, { status });

/** POST /api/contact logic, kept free of Next.js and Resend so it is easy to unit test. */
export async function handleContact(req: Request, deps: ContactDeps): Promise<Response> {
  const now = deps.now ?? Date.now;

  // Same-origin only: reject browser requests coming from other sites.
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return json(403, { ok: false, error: 'forbidden' });
    } catch {
      return json(403, { ok: false, error: 'forbidden' });
    }
  }

  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES)
    return json(413, { ok: false, error: 'too_large' });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'validation', fields: {} });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success)
    return json(400, { ok: false, error: 'validation', fields: fieldErrors(parsed.error) });
  const msg = parsed.data;

  // Bots: pretend success, send nothing.
  if (msg.company || now() - msg.startedAt < MIN_FILL_MS) return json(200, { ok: true });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!deps.allow(ip)) return json(429, { ok: false, error: 'rate_limited' });

  if (!deps.send) return json(503, { ok: false, error: 'unavailable' });
  try {
    await deps.send(msg, { page: req.headers.get('referer') ?? 'unknown' });
  } catch {
    return json(503, { ok: false, error: 'unavailable' });
  }
  return json(200, { ok: true });
}
