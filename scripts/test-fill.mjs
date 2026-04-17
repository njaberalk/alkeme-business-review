import { writeFile } from 'node:fs/promises';
import { fillTemplate, resolveTemplatePath } from '../app/api/submit/fillTemplate.js';

const contact = {
  companyName: 'Coastal Freight Co.',
  contactName: 'Dana Reyes',
  title: 'Director of Operations',
  email: 'dana@coastalfreight.example',
  phone: '555-0188',
  employees: '84',
  date: '2026-04-16',
};

const answers = {
  q1: 'Mostly internal — one HR generalist plus a local payroll bureau for tax filings.',
  q2: 'Standardizing onboarding so new hires are productive from day one.',
  q4: 'Running payroll via ADP; fairly confident but quarterly tax filings still feel manual.',
  q6: 'Yes — three states, adding a fourth next quarter.',
  q10: 7,
  q16: 9,
  q18: 'Yes',
  q20: 'One minor claim two years ago, no audits.',
  q29: 8,
};

const { buffer, report } = await fillTemplate({
  contact,
  answers,
  templatePath: resolveTemplatePath(),
});
await writeFile('C:/Users/NicholasJaber/AppData/Local/Temp/filled-test.docx', buffer);
console.log('wrote', buffer.length, 'bytes');
console.log('report', report);
