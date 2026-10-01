import { z } from 'zod';

/** Shared by the contact form (client) and POST /api/contact (server). See BACKEND.md §3. */
export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(80, 'Name is too long (max 80 characters)'),
  email: z.string().trim().max(120, 'Email is too long').pipe(z.email('Enter a valid email')),
  message: z
    .string()
    .trim()
    .min(10, 'Message should be at least 10 characters')
    .max(3000, 'Message is too long (max 3,000 characters)'),
  /** Honeypot: hidden from people, bots fill it in. Must be empty. */
  company: z.string().max(200).optional().default(''),
  /** When the form was shown (epoch ms). Used to drop instant bot submissions. */
  startedAt: z.number().int().nonnegative(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactMessage = z.output<typeof contactSchema>;
export type ContactField = 'name' | 'email' | 'message';

export const MIN_FILL_MS = 3000;
export const MAX_BODY_BYTES = 10_000;

/** First error message for each field, for showing under the inputs. */
export function fieldErrors(error: z.ZodError): Partial<Record<ContactField, string>> {
  const out: Partial<Record<ContactField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if ((key === 'name' || key === 'email' || key === 'message') && !out[key]) out[key] = issue.message;
  }
  return out;
}
