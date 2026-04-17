# ALKEME Business Review Intake Form

A Next.js 15 multi-step intake form built from the ALKEME Business Review Questionnaire.

**29 questions across 6 sections** — HR, Payroll & Benefits, Compliance & Risk, HR Operations & Support, Systems & Technology, Workers' Comp & Workplace Safety, and Strategic & Financial Outlook — plus a contact block and a final review step.

On submit the server returns **two files** built from the submitted data:

- `<company>-business-review.docx` — the original ALKEME Word template with the answers injected in place
- `<company>-business-review.pdf` — a branded, single-file PDF of the same responses (no Word required to view)

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

## Deploy (host-agnostic)

This app is plain Next.js. Nothing here is Vercel-specific — it will run anywhere Node 18+ runs.

### Option 1: Standalone server (recommended)

`next.config.mjs` is set to `output: 'standalone'`, so `npm run build` produces a self-contained bundle you can copy anywhere.

```bash
npm install
npm run build

# The deployable bundle is written to .next/standalone/
# Copy these three things to your server:
#   .next/standalone/            (the app + trimmed node_modules)
#   .next/static/      →  place at .next/standalone/.next/static/
#   public/            →  place at .next/standalone/public/
#   templates/         →  already copied in by outputFileTracingIncludes

# Then on the server:
cd .next/standalone
node server.js
# listens on $PORT (default 3000)
```

Set `PORT` and `HOSTNAME` env vars if you need to bind somewhere specific.

### Option 2: Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/templates ./templates
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### Option 3: Classic `next start`

```bash
npm install
npm run build
npm start
# listens on $PORT (default 3000)
```

### Option 4: Vercel / Netlify / Cloudflare Pages

Just point the platform at this repo. Framework detection handles it.

## What the tech team needs to wire up later

- **Email forwarding** — inside `app/api/submit/route.js` after the fill succeeds. The filled `.docx` and `.pdf` buffers are both generated from the same payload, so attach whichever (or both) to the outbound email.
- **Storage** — optional; if they want to archive submissions, write the buffers to S3 / Blob / disk before returning.

No breaking changes needed — the endpoint contract (POST JSON → receive docx) stays the same.

## Deploy

Configured for Vercel. Connect the GitHub repo and deploy — no further config required.
