import { sendContactEmail } from '@/lib/contact-email';
import { handleContact } from '@/lib/contact-handler';
import { getContactEnv } from '@/lib/env';
import { createRateLimiter } from '@/lib/rate-limit';

// 5 messages per IP per 10 minutes (per serverless instance).
const allow = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

/** POST /api/contact: the site's only backend endpoint. Spec: BACKEND.md. */
export async function POST(req: Request) {
  const env = getContactEnv();
  return handleContact(req, {
    allow,
    send: env ? (msg, meta) => sendContactEmail(env, msg, meta) : null,
  });
}
