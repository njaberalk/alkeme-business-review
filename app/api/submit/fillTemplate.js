import JSZip from 'jszip';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const QUESTION_MATCHERS = [
  { id: 'q1', needle: 'How are HR, payroll, and benefits currently handled' },
  { id: 'q2', needle: 'wave a magic wand and fix one people-related issue' },
  { id: 'q3', needle: 'leadership team spend on employee-related admin' },
  { id: 'q4', needle: 'confident do you feel in accuracy and' },
  { id: 'q5', needle: 'payroll or tax-related issues come up' },
  { id: 'q6', needle: 'operating in more than one state' },
  { id: 'q7', needle: 'wage &amp; hour compliance' },
  { id: 'q8', needle: 'payroll or tax compliance caused stress' },
  { id: 'q9', needle: 'day-to-day HR issues like onboarding' },
  { id: 'q10', needle: 'policies and handbook are current and compliant' },
  { id: 'q11', needle: 'performance management, discipline, and terminations' },
  { id: 'q12', needle: 'HR issue escalates' },
  { id: 'q13', needle: 'do you see HR becoming more or less manageable' },
  { id: 'q14', needle: 'systems are you using today for payroll' },
  { id: 'q15', needle: 'platforms integrated' },
  { id: 'q16', needle: 'access paystubs, benefits, PTO' },
  { id: 'q17', needle: 'managers have the tools they need' },
  { id: 'q18', needle: 'simplify your tech stack into one platform' },
  { id: 'q19', needle: "managing workers&#8217; comp and workplace safety", altNeedle: "managing workers' comp and workplace safety" },
  { id: 'q20', needle: 'claims or audits in the last few' },
  { id: 'q21', needle: "Workers&#8217; Comp costs mostly consistent", altNeedle: "Workers' Comp costs mostly consistent" },
  { id: 'q22', needle: 'formal safety program or training' },
  { id: 'q23', needle: 'risk sharing and claims support' },
  { id: 'q24', needle: 'employee-related costs impact your overall profitability' },
  { id: 'q25', needle: 'necessary expense or a strategic advantage' },
  { id: 'q26', needle: 'scalability as you plan for growth' },
  { id: 'q27', needle: 'offload administrative burden' },
  { id: 'q28', needle: 'final decision maker within your organization' },
  { id: 'q29', needle: 'overall appetite to explore options' },
];

// Contact textboxes in the original each contain a label like "Company Name".
// We find each label's enclosing <wps:wsp> and append a value paragraph.
const CONTACT_LABELS = [
  { id: 'companyName', labelText: 'Company ' },
  { id: 'contactName', labelText: 'Contact ' },
  { id: 'title', labelText: '>Title<' },
  { id: 'email', labelText: 'Email ' },
  { id: 'phone', labelText: 'Phone ' },
  { id: 'employees', labelText: 'Employees' },
  { id: 'date', labelText: '>Date<' },
];

function xmlEscape(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#8217;');
}

function answerParagraph(text) {
  const safe = xmlEscape(text).split('\n').filter((s) => s.length > 0);
  if (safe.length === 0) return '';
  const runs = safe
    .map(
      (line, i) =>
        `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="25475E"/><w:sz w:val="22"/></w:rPr>${
          i === 0 ? '' : '<w:br/>'
        }<w:t xml:space="preserve">${line}</w:t></w:r>`,
    )
    .join('');
  return (
    '<w:p>' +
    '<w:pPr>' +
    '<w:pStyle w:val="BodyText"/>' +
    '<w:spacing w:before="120" w:after="80"/>' +
    '<w:ind w:left="656" w:right="600"/>' +
    '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="25475E"/><w:sz w:val="22"/></w:rPr>' +
    '</w:pPr>' +
    runs +
    '</w:p>'
  );
}

function contactValueParagraph(text) {
  const safe = xmlEscape(text);
  if (!safe) return '';
  return (
    '<w:p>' +
    '<w:pPr>' +
    '<w:spacing w:before="60"/>' +
    '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="18"/></w:rPr>' +
    '</w:pPr>' +
    `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="25475E"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">${safe}</w:t></w:r>` +
    '</w:p>'
  );
}

function injectAfterQuestion(xml, needle, answerXml) {
  const idx = xml.indexOf(needle);
  if (idx === -1) return { xml, injected: false };
  const close = xml.indexOf('</w:p>', idx);
  if (close === -1) return { xml, injected: false };
  const insertAt = close + '</w:p>'.length;
  return {
    xml: xml.slice(0, insertAt) + answerXml + xml.slice(insertAt),
    injected: true,
  };
}

function injectContactValue(xml, labelNeedle, valueXml) {
  if (!valueXml) return { xml, injected: false };
  const idx = xml.indexOf(labelNeedle);
  if (idx === -1) return { xml, injected: false };
  // Close of the wps:txbx containing this label
  const txbxEnd = xml.indexOf('</w:txbxContent>', idx);
  if (txbxEnd === -1) return { xml, injected: false };
  return {
    xml: xml.slice(0, txbxEnd) + valueXml + xml.slice(txbxEnd),
    injected: true,
  };
}

function formatRating(value) {
  if (value == null || value === '') return '';
  return `${value} / 10`;
}

export async function fillTemplate({ contact, answers, templatePath }) {
  const buf = await readFile(templatePath);
  const zip = await JSZip.loadAsync(buf);
  const xmlFile = zip.file('word/document.xml');
  if (!xmlFile) throw new Error('document.xml not found in template');
  let xml = await xmlFile.async('string');

  const report = { questionsInjected: 0, contactInjected: 0, missed: [] };

  // Inject answers for each question
  for (const q of QUESTION_MATCHERS) {
    const raw = answers?.[q.id];
    const text = typeof raw === 'number' ? formatRating(raw) : raw;
    if (!text) continue;
    const ansXml = answerParagraph(text);
    let res = injectAfterQuestion(xml, q.needle, ansXml);
    if (!res.injected && q.altNeedle) {
      res = injectAfterQuestion(xml, q.altNeedle, ansXml);
    }
    if (res.injected) {
      xml = res.xml;
      report.questionsInjected += 1;
    } else {
      report.missed.push(q.id);
    }
  }

  // Inject contact values into their label textboxes
  for (const field of CONTACT_LABELS) {
    const val = contact?.[field.id];
    if (!val) continue;
    const valueXml = contactValueParagraph(val);
    const res = injectContactValue(xml, field.labelText, valueXml);
    if (res.injected) {
      xml = res.xml;
      report.contactInjected += 1;
    } else {
      report.missed.push(field.id);
    }
  }

  zip.file('word/document.xml', xml);
  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  return { buffer, report };
}

export function resolveTemplatePath() {
  // Prefer a path relative to this source file so the route works regardless
  // of the process cwd (Vercel serverless, Node server, Docker, etc.).
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const viaSource = path.resolve(here, '..', '..', '..', 'templates', 'business-review.docx');
    return viaSource;
  } catch {
    return path.join(process.cwd(), 'templates', 'business-review.docx');
  }
}
