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

Submissions `POST` to `/api/submit`. Out of the box the API logs the full payload to the server console and returns `{ ok: true }`.

To forward submissions by email, set these env vars (e.g. in Vercel project settings):

| Var | Purpose |
| --- | --- |
| `RESEND_API_KEY` | [Resend](https://resend.com) API key |
| `NOTIFY_EMAIL` | Destination address (e.g. your advisor inbox) |

When set, each submission is emailed to `NOTIFY_EMAIL` with the full JSON payload.

## Deploy

Configured for Vercel. Connect the GitHub repo and deploy — no further config required.
