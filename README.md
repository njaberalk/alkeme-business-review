# ALKEME Business Review Intake Form

A Next.js 15 multi-step intake form built from the ALKEME Business Review Questionnaire.

**29 questions across 6 sections** — HR, Payroll & Benefits, Compliance & Risk, HR Operations & Support, Systems & Technology, Workers' Comp & Workplace Safety, and Strategic & Financial Outlook — plus a contact block and a final review step.

## Run locally

```bash
npm install
npm run dev
# http://localhost:3000
```

## Submission handling

Submissions `POST` to `/api/submit`. The route:

1. Reads `templates/business-review.docx` (the original ALKEME questionnaire).
2. Injects the submitted contact info into the contact-block textboxes and each answer paragraph after its matching question.
3. Returns the filled `.docx` as a binary download (`Content-Disposition: attachment`).

The client saves it via `createObjectURL` and offers a **Download filled questionnaire** button on the success screen.

Email forwarding is not yet wired — the tech team will layer that on top of the same endpoint later.

## Deploy

Configured for Vercel. Connect the GitHub repo and deploy — no further config required.
