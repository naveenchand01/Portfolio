import 'server-only';

export type ContactEnv = { apiKey: string; to: string; from: string };

/** Contact-form settings from environment variables, or null if the backend isn't configured. */
export function getContactEnv(): ContactEnv | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || 'Portfolio <onboarding@resend.dev>';
  if (!apiKey || !to) return null;
  return { apiKey, to, from };
}
