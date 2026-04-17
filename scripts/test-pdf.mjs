import { writeFile } from 'node:fs/promises';

const res = await fetch('http://127.0.0.1:3004/api/submit-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contact: {
      companyName: 'Coastal Freight Co.',
      contactName: 'Dana Reyes',
      title: 'Director of Operations',
      email: 'dana@coastalfreight.example',
      phone: '555-0188',
      employees: '84',
      date: '2026-04-16',
    },
    answers: {
      q1: 'Mostly internal — one HR generalist plus a local payroll bureau for tax filings.',
      q2: 'Standardizing onboarding so new hires are productive from day one.',
      q4: 'Running payroll via ADP; fairly confident but quarterly tax filings still feel manual.',
      q6: 'Yes — three states, adding a fourth next quarter.',
      q10: 7,
      q16: 9,
      q18: 'Yes',
      q20: 'One minor claim two years ago, no audits.',
      q29: 8,
    },
  }),
});

if (!res.ok) {
  console.error('failed', res.status, await res.text());
  process.exit(1);
}

const buf = Buffer.from(await res.arrayBuffer());
await writeFile('C:/Users/NicholasJaber/AppData/Local/Temp/filled-test.pdf', buf);
console.log('wrote', buf.length, 'bytes');
