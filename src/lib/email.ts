/**
 * Transactional email — uses Resend HTTP API when RESEND_API_KEY is set;
 * otherwise logs the payload (fine for local/dev).
 */
import { log } from '@/lib/logger';

type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendTransactionalEmail({ to, subject, text, html }: SendEmailArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim() || 'ISIC <onboarding@resend.dev>';

  if (!apiKey) {
    log.info('email_stub', {
      to,
      subject,
      preview: text.slice(0, 200),
    });
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html: html ?? `<pre style="font-family:sans-serif">${escapeHtml(text)}</pre>`,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Resend failed ${res.status}: ${errText}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
