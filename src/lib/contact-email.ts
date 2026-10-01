import 'server-only';
import { Resend } from 'resend';
import type { ContactMessage } from './contact-schema';
import type { ContactEnv } from './env';

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );

/** Sends the contact message to Naveen. Reply-To is the visitor, so "Reply" in Gmail answers them. */
export async function sendContactEmail(env: ContactEnv, msg: ContactMessage, meta: { page: string }) {
  const time = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
  const text = `${msg.message}\n\n— ${msg.name} <${msg.email}>\nSent ${time} IST from ${meta.page}`;
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">
<p style="white-space:pre-wrap">${escapeHtml(msg.message)}</p>
<hr style="border:0;border-top:1px solid #ddd;margin:20px 0">
<p style="color:#555;font-size:13px">From <strong>${escapeHtml(msg.name)}</strong> &lt;${escapeHtml(msg.email)}&gt;<br>
Sent ${escapeHtml(time)} IST from ${escapeHtml(meta.page)}</p></div>`;

  const { error } = await new Resend(env.apiKey).emails.send({
    from: env.from,
    to: env.to,
    replyTo: msg.email,
    subject: `Portfolio: message from ${msg.name}`,
    text,
    html,
  });
  if (error) throw new Error(error.message);
}
