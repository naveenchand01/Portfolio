# Portfolio v2: Backend Spec

**Status:** Built (D1 = a, chosen 2026-10-01). Code is done and unit-tested; it starts sending real email once Naveen adds the Resend API key (§9). Part of [PRD.md](PRD.md) §7.

## 1. Do we need a backend?

Only for one thing: **the contact form.** Every page is static. No database, no user accounts, no admin panel.

| Without backend (D1 = b) | With backend (D1 = a) |
|---|---|
| The form opens the visitor's email app; many visitors give up there | The message is sent from the page and lands in Naveen's Gmail |
| Zero setup | One free Resend account + 3 env vars |

## 2. Shape

```
ContactForm (client)
   │  fetch POST /api/contact  (JSON)
   ▼
src/app/api/contact/route.ts   ← Vercel Function, Node.js runtime
   1. Parse JSON body
   2. Validate with contactSchema (Zod, shared with the form)
   3. Spam checks: honeypot · time-to-submit · rate limit
   4. Send email with Resend
   5. Return JSON
   ▼
Resend API ──▶ naveenchand01042002@gmail.com   (Reply-To = visitor's email)
```

Files:

| File | Purpose |
|---|---|
| `src/app/api/contact/route.ts` | The endpoint (only `POST`; everything else returns 405) |
| `src/lib/contact-schema.ts` | Zod schema + TypeScript type, used by both form and route |
| `src/lib/env.ts` | Reads and validates env vars at startup; the route fails closed if they're missing |
| `src/lib/rate-limit.ts` | Small per-IP limiter (see §5) |
| `src/components/sections/contact/ContactForm.tsx` | Client form: idle → sending → sent / error states |
| `tests/unit/contact-schema.test.ts`, `tests/unit/contact-route.test.ts` | Unit tests (Resend mocked) |
| `tests/e2e/contact.spec.ts` | Browser test with the API intercepted |

## 3. API contract

**`POST /api/contact`**, `Content-Type: application/json`

Request body:

| Field | Type | Rules |
|---|---|---|
| `name` | string | Required, 1–80 chars, trimmed |
| `email` | string | Required, valid email, max 120 chars |
| `message` | string | Required, 10–3,000 chars |
| `company` | string | **Honeypot**: hidden field, must be empty |
| `startedAt` | number | Epoch ms when the form was shown; set by the client |

Responses:

| Status | Body | When |
|---|---|---|
| `200` | `{ "ok": true }` | Email accepted by Resend |
| `200` | `{ "ok": true }` | Honeypot filled or submitted in under 3 s. Pretend success so bots learn nothing; nothing is sent |
| `400` | `{ "ok": false, "error": "validation", "fields": { "email": "Enter a valid email" } }` | Zod validation failed |
| `405` | `{ "ok": false, "error": "method_not_allowed" }` | Not POST |
| `413` | `{ "ok": false, "error": "too_large" }` | Body over 10 KB |
| `429` | `{ "ok": false, "error": "rate_limited" }` | More than 5 messages per IP per 10 minutes |
| `503` | `{ "ok": false, "error": "unavailable" }` | Env vars missing or Resend down. The form then shows the `mailto:` fallback |

## 4. Email

- **Provider:** Resend (free tier: 3,000 emails/month, 100/day, far more than a portfolio needs).
- **From:** `Portfolio <onboarding@resend.dev>`. Resend's shared sender only delivers to the email that owns the Resend account, which is exactly Naveen's Gmail. If a custom domain is bought later (D4), switch to `hello@<domain>` after verifying it in Resend.
- **To:** `CONTACT_TO_EMAIL` (Naveen's Gmail). **Reply-To:** the visitor's email, so pressing Reply in Gmail answers them directly.
- **Subject:** `Portfolio: message from {name}`.
- **Body:** plain text plus a simple HTML version. All visitor input is HTML-escaped. The email includes the time (IST) and the page it came from.

## 5. Security and abuse protection

1. **Validation:** Zod on the server is the source of truth; client-side checks only improve the experience.
2. **Honeypot + timing:** a hidden `company` field and a minimum of 3 s between showing and sending the form stop most bots silently.
3. **Rate limit:** 5 requests per IP per 10 minutes. v2 starts with an in-memory limiter (best effort, since each serverless instance has its own memory). If real spam appears, upgrade to a Vercel Firewall rate-limit rule or Upstash Redis (both have free tiers). No code changes outside `rate-limit.ts`.
4. **Secrets:** `RESEND_API_KEY` exists only in Vercel env vars and is never sent to the browser (no `NEXT_PUBLIC_` prefix) or committed.
5. **Same-origin only:** no CORS headers are added, so other sites can't call the endpoint from a browser. The route also checks the `Origin` header.
6. **Size limit:** bodies over 10 KB are rejected before parsing.
7. **Privacy:** messages are not stored anywhere except Naveen's inbox. Logs record status codes and timing only, never names, emails or message text.

## 6. Environment variables

`.env.example` (committed) documents them; real values go in `.env.local` (git-ignored) and the Vercel dashboard.

```
RESEND_API_KEY=            # from resend.com → API Keys (Naveen creates it)
CONTACT_TO_EMAIL=naveenchand01042002@gmail.com
CONTACT_FROM_EMAIL=Portfolio <onboarding@resend.dev>
```

## 7. Frontend behaviour

| State | What the visitor sees |
|---|---|
| Idle | Name, email, message fields and a "Send message →" button |
| Sending | Button shows a liquid progress fill; fields locked |
| Sent | Form morphs into "Thanks, I'll reply within a day." with a check animation |
| Validation error | Inline message under the field; focus moves to the first error |
| Rate limited / unavailable | "Couldn't send right now." plus an **Email me directly** button (`mailto:` with the message pre-filled) |

## 8. Testing

- **Unit (Vitest):**
  - The schema accepts and rejects the right inputs.
  - The route returns 200, 400, 405, 413, 429 and 503 in the right cases.
  - Honeypot and timing paths never call Resend.
  - Resend errors map to 503.
- **E2E (Playwright):** the form submits (API intercepted) and shows the success state; the error state shows the mailto fallback.
- **Manual (Phase 4):** one real message from the Vercel preview arrives in Gmail with a working Reply-To.

## 9. What Naveen needs to do

1. Create a free account at resend.com with **naveenchand01042002@gmail.com**. Claude can't create accounts.
2. Create an API key, then paste it into Vercel → Project → Settings → Environment Variables as `RESEND_API_KEY`. Don't paste it in chat.
3. Reply to the first test email to confirm Reply-To works.

## 10. Cost

| Item | Cost |
|---|---|
| Vercel Hobby (hosting + function) | Free |
| Resend free tier | Free |
| Upstash / Vercel Firewall (only if spam appears) | Free tier |
