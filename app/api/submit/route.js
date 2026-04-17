import { NextResponse } from 'next/server';
import { fillTemplate, resolveTemplatePath } from './fillTemplate';

export const runtime = 'nodejs';

function safeSlug(value, fallback = 'alkeme-review') {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

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

  let buffer;
  let report;
  try {
    const templatePath = resolveTemplatePath();
    const result = await fillTemplate({ contact, answers, templatePath });
    buffer = result.buffer;
    report = result.report;
  } catch (err) {
    console.error('[alkeme-intake] template fill failed', err);
    return NextResponse.json(
      { error: 'Failed to generate filled questionnaire' },
      { status: 500 },
    );
  }

  console.log(
    '[alkeme-intake] submission',
    JSON.stringify({
      receivedAt: new Date().toISOString(),
      company: contact.companyName,
      contact: contact.contactName,
      email: contact.email,
      report,
    }),
  );

  const filename = `${safeSlug(contact.companyName)}-business-review.docx`;
  return new Response(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(buffer.length),
      'X-Alkeme-Report': JSON.stringify(report),
    },
  });
}
