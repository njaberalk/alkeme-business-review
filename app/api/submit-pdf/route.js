import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { SECTIONS, CONTACT_FIELDS } from '../../questions';

export const runtime = 'nodejs';

const NAVY = '#25475e';
const NAVY_DEEP = '#1b3648';
const GOLD = '#ffbf3b';
const GOLD_SOFT = '#f4c869';
const STONE = '#f4f4ec';
const BRIGHT_BLUE = '#74a7f5';
const INK = '#2a2a2a';
const MUTED = '#6b7684';
const BORDER = '#d9d8d0';

function safeSlug(value, fallback = 'alkeme-review') {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

function formatRating(value) {
  if (value == null || value === '') return '';
  return `${value} / 10`;
}

function hasValue(v) {
  if (v == null) return false;
  if (typeof v === 'string' && v.trim() === '') return false;
  return true;
}

async function renderPdf({ contact, answers }) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margin: 0,
    autoFirstPage: true,
    bufferPages: true,
    info: {
      Title: 'ALKEME Business Review Questionnaire',
      Author: 'ALKEME',
      Subject: `Business Review — ${contact.companyName || ''}`,
    },
  });

  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const pageW = 612; // 8.5"
  const margin = 48;
  const contentW = pageW - margin * 2;

  // ----- HERO BANNER -----
  doc.rect(0, 0, pageW, 170).fill(NAVY);
  // accent dot
  doc.circle(pageW - 80, 40, 90).fillOpacity(0.08).fill(GOLD).fillOpacity(1);
  doc
    .fillColor(STONE)
    .font('Helvetica-Bold')
    .fontSize(22)
    .text('ALKEME', margin, 36, { characterSpacing: 4 });
  doc
    .fillColor(GOLD_SOFT)
    .font('Helvetica-Oblique')
    .fontSize(10)
    .text('Insurance everything.', margin, 64);
  doc
    .fillColor(GOLD)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('BUSINESS REVIEW QUESTIONNAIRE', margin, 96, {
      characterSpacing: 3,
    });
  doc
    .fillColor(STONE)
    .font('Helvetica-Bold')
    .fontSize(20)
    .text(contact.companyName || 'Business Review', margin, 114, {
      width: contentW,
      lineBreak: false,
    });
  doc
    .fillColor('#dde3e9')
    .font('Helvetica')
    .fontSize(9)
    .text(
      `Submitted ${new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`,
      margin,
      144,
    );

  let y = 200;

  // ----- CONTACT INFO -----
  doc
    .fillColor(BRIGHT_BLUE)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('CONTACT INFORMATION', margin, y, { characterSpacing: 3 });
  y += 16;

  const colW = (contentW - 16) / 2;
  const rowH = 34;
  let col = 0;
  let startY = y;
  CONTACT_FIELDS.forEach((f) => {
    const value = contact?.[f.name];
    const x = margin + col * (colW + 16);
    const rowY = startY + Math.floor((CONTACT_FIELDS.indexOf(f)) / 2) * rowH;
    doc
      .fillColor(MUTED)
      .font('Helvetica-Bold')
      .fontSize(7)
      .text(f.label.toUpperCase(), x, rowY, {
        characterSpacing: 1.2,
        width: colW,
      });
    doc
      .fillColor(INK)
      .font('Helvetica')
      .fontSize(11)
      .text(hasValue(value) ? String(value) : '—', x, rowY + 10, {
        width: colW,
        ellipsis: true,
      });
    col = col === 0 ? 1 : 0;
  });
  y = startY + Math.ceil(CONTACT_FIELDS.length / 2) * rowH + 8;

  // Divider
  doc
    .strokeColor(BORDER)
    .lineWidth(0.75)
    .moveTo(margin, y)
    .lineTo(margin + contentW, y)
    .stroke();
  y += 18;

  // ----- SECTIONS -----
  const pageBottom = 720; // leave room for footer

  function ensureRoom(needed) {
    if (y + needed > pageBottom) {
      addFooter();
      doc.addPage({ size: 'LETTER', margin: 0 });
      y = 56;
    }
  }

  function drawSectionHeader(section) {
    ensureRoom(50);
    doc
      .fillColor(BRIGHT_BLUE)
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(`${section.label.toUpperCase()} · ${section.title.toUpperCase()}`, margin, y, {
        characterSpacing: 3,
      });
    y += 14;
    doc
      .fillColor(NAVY)
      .font('Helvetica-Bold')
      .fontSize(15)
      .text(section.title, margin, y);
    y += 22;
  }

  function drawQuestion(q, answer) {
    const answerText =
      q.type === 'rating' ? formatRating(answer) : answer ? String(answer) : '';
    const prompt = `Q${q.n}. ${q.prompt}`;

    // Compute height
    const promptH = doc.heightOfString(prompt, {
      width: contentW - 16,
      font: 'Helvetica-Bold',
      fontSize: 10,
    });
    const answerH = answerText
      ? doc.heightOfString(answerText, {
          width: contentW - 16,
          fontSize: 11,
        })
      : 14;
    const blockH = 16 + promptH + 8 + answerH + 14;

    ensureRoom(blockH);

    // Gold accent bar
    doc.rect(margin, y + 4, 3, promptH + 16 + answerH).fill(GOLD);

    doc
      .fillColor(NAVY)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(prompt, margin + 12, y + 4, { width: contentW - 16 });

    const answerY = y + 4 + promptH + 8;
    if (answerText) {
      doc
        .fillColor(INK)
        .font('Helvetica')
        .fontSize(11)
        .text(answerText, margin + 12, answerY, {
          width: contentW - 16,
        });
    } else {
      doc
        .fillColor(MUTED)
        .font('Helvetica-Oblique')
        .fontSize(10)
        .text('Skipped', margin + 12, answerY);
    }

    y = answerY + answerH + 14;
  }

  function addFooter() {
    const footerY = 750;
    doc
      .strokeColor(BORDER)
      .lineWidth(0.5)
      .moveTo(margin, footerY)
      .lineTo(margin + contentW, footerY)
      .stroke();
    doc
      .fillColor(MUTED)
      .font('Helvetica')
      .fontSize(7)
      .text(
        'ALKEME Workforce Management Solutions · Confidential Prospect Information',
        margin,
        footerY + 8,
        { width: contentW, align: 'center', characterSpacing: 1 },
      );
  }

  SECTIONS.forEach((section) => {
    drawSectionHeader(section);
    section.questions.forEach((q) => drawQuestion(q, answers?.[q.id]));
    y += 6;
  });

  // Add footer to last page
  addFooter();

  // Add page numbers
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .fillColor(MUTED)
      .font('Helvetica')
      .fontSize(7)
      .text(
        `Page ${i - range.start + 1} of ${range.count}`,
        margin,
        770,
        { width: contentW, align: 'right' },
      );
  }

  doc.end();
  return done;
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
  try {
    buffer = await renderPdf({ contact, answers });
  } catch (err) {
    console.error('[alkeme-intake] pdf render failed', err);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }

  const filename = `${safeSlug(contact.companyName)}-business-review.pdf`;
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(buffer.length),
    },
  });
}
