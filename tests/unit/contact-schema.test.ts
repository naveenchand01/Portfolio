import { describe, expect, it } from 'vitest';
import { contactSchema, fieldErrors } from '@/lib/contact-schema';

const valid = {
  name: 'Jane',
  email: 'jane@acme.com',
  message: 'We are hiring a new grad SDE.',
  startedAt: 1,
};

describe('contactSchema', () => {
  it('accepts a valid message and trims fields', () => {
    const r = contactSchema.parse({ ...valid, name: '  Jane  ' });
    expect(r.name).toBe('Jane');
    expect(r.company).toBe('');
  });

  it.each([
    ['name', { name: '' }],
    ['email', { email: 'not-an-email' }],
    ['message', { message: 'too short' }],
    ['message', { message: 'x'.repeat(3001) }],
  ] as const)('rejects a bad %s', (field, patch) => {
    const r = contactSchema.safeParse({ ...valid, ...patch });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error)[field]).toBeTruthy();
  });

  it('requires startedAt', () => {
    const { startedAt: _, ...rest } = valid;
    expect(contactSchema.safeParse(rest).success).toBe(false);
  });
});
