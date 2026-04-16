import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { contact, answers } = body || {};
  if (!contact?.companyName || !contact?.email) {
    return NextResponse.json(
      { error: 'Missing required contact info' },
      { status: 400 },
    );
  }

  const record = {
    receivedAt: new Date().toISOString(),
    contact,
    answers,
  };

  console.log('[alkeme-intake] submission', JSON.stringify(record));

  const resendKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;
  if (resendKey && notifyEmail) {
    try {
      await sendViaResend({ apiKey: resendKey, to: notifyEmail, record });
    } catch (err) {
      console.error('[alkeme-intake] email send failed', err);
    }
  }

  return NextResponse.json({ ok: true });
}

async function sendViaResend({ apiKey, to, record }) {
  const lines = [];
  lines.push(`New ALKEME Business Review submission`);
  lines.push('');
  lines.push(`Company: ${record.contact.companyName}`);
  lines.push(`Contact: ${record.contact.contactName} (${record.contact.email})`);
  lines.push(`Received: ${record.receivedAt}`);
  lines.push('');
  lines.push(JSON.stringify(record, null, 2));

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'ALKEME Intake <onboarding@resend.dev>',
      to: [to],
      subject: `New Business Review: ${record.contact.companyName}`,
      text: lines.join('\n'),
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Resend ${res.status}: ${t}`);
  }
}
