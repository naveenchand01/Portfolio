import { describe, expect, it, vi } from 'vitest';
import { type ContactDeps, handleContact } from '@/lib/contact-handler';

const NOW = 1_800_000_000_000;
const body = {
  name: 'Jane',
  email: 'jane@acme.com',
  message: 'We are hiring a new grad SDE.',
  startedAt: NOW - 10_000,
};

function req(payload: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', host: 'localhost:3000', ...headers },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  });
}

function deps(over: Partial<ContactDeps> = {}): ContactDeps {
  return { send: vi.fn().mockResolvedValue(undefined), allow: () => true, now: () => NOW, ...over };
}

describe('handleContact', () => {
  it('sends a valid message and returns 200', async () => {
    const d = deps();
    const res = await handleContact(req(body), d);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(d.send).toHaveBeenCalledOnce();
  });

  it('returns 400 with field errors for invalid input', async () => {
    const res = await handleContact(req({ ...body, email: 'nope' }), deps());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields.email).toBeTruthy();
  });

  it('returns 400 for malformed JSON', async () => {
    expect((await handleContact(req('{oops'), deps())).status).toBe(400);
  });

  it('silently drops honeypot and too-fast submissions without sending', async () => {
    const d = deps();
    expect((await handleContact(req({ ...body, company: 'Bots Inc' }), d)).status).toBe(200);
    expect((await handleContact(req({ ...body, startedAt: NOW - 500 }), d)).status).toBe(200);
    expect(d.send).not.toHaveBeenCalled();
  });

  it('returns 413 for oversized bodies', async () => {
    const res = await handleContact(req({ ...body, message: 'x'.repeat(20_000) }), deps());
    expect(res.status).toBe(413);
  });

  it('returns 429 when rate limited', async () => {
    const res = await handleContact(req(body), deps({ allow: () => false }));
    expect(res.status).toBe(429);
  });

  it('returns 503 when the backend is not configured or sending fails', async () => {
    expect((await handleContact(req(body), deps({ send: null }))).status).toBe(503);
    const failing = deps({ send: vi.fn().mockRejectedValue(new Error('resend down')) });
    expect((await handleContact(req(body), failing)).status).toBe(503);
  });

  it('rejects cross-origin requests', async () => {
    const res = await handleContact(req(body, { origin: 'https://evil.example' }), deps());
    expect(res.status).toBe(403);
  });
});
