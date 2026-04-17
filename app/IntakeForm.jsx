'use client';

import { useMemo, useState } from 'react';
import { CONTACT_FIELDS, SECTIONS, TOTAL_QUESTIONS } from './questions';

const STEP_CONTACT = 0;
const STEP_REVIEW_OFFSET = SECTIONS.length + 1;

function fieldIsEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

export default function IntakeForm() {
  const [step, setStep] = useState(STEP_CONTACT);
  const [contact, setContact] = useState(() => {
    const init = {};
    CONTACT_FIELDS.forEach((f) => (init[f.name] = ''));
    init.date = new Date().toISOString().slice(0, 10);
    return init;
  });
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [docxUrl, setDocxUrl] = useState(null);
  const [docxName, setDocxName] = useState('alkeme-business-review.docx');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfName, setPdfName] = useState('alkeme-business-review.pdf');

  const totalSteps = SECTIONS.length + 2; // contact + sections + review
  const progressPct = Math.round(((step) / (totalSteps - 1)) * 100);

  const answeredCount = useMemo(
    () =>
      SECTIONS.reduce(
        (acc, s) =>
          acc +
          s.questions.filter((q) => !fieldIsEmpty(answers[q.id])).length,
        0,
      ),
    [answers],
  );

  function goNext() {
    if (step === STEP_CONTACT) {
      const newErrs = {};
      CONTACT_FIELDS.forEach((f) => {
        if (f.required && fieldIsEmpty(contact[f.name])) {
          newErrs[f.name] = 'Required';
        }
      });
      if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
        newErrs.email = 'Enter a valid email';
      }
      setErrors(newErrs);
      if (Object.keys(newErrs).length) return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, totalSteps - 1));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateContact(name, value) {
    setContact((c) => ({ ...c, [name]: value }));
  }

  function updateAnswer(id, value) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = { contact, answers, submittedAt: new Date().toISOString() };
      const post = (path) =>
        fetch(path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      const [docxRes, pdfRes] = await Promise.all([
        post('/api/submit'),
        post('/api/submit-pdf'),
      ]);
      if (!docxRes.ok) throw new Error('Word document generation failed');
      if (!pdfRes.ok) throw new Error('PDF generation failed');

      const [docxBlob, pdfBlob] = await Promise.all([
        docxRes.blob(),
        pdfRes.blob(),
      ]);
      const extractName = (res, fallback) => {
        const disp = res.headers.get('Content-Disposition') || '';
        const m = disp.match(/filename="?([^";]+)"?/i);
        return m ? m[1] : fallback;
      };
      setDocxName(extractName(docxRes, docxName));
      setPdfName(extractName(pdfRes, pdfName));
      setDocxUrl(URL.createObjectURL(docxBlob));
      setPdfUrl(URL.createObjectURL(pdfBlob));
      setSubmitted(true);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setSubmitError(
        'Something went wrong generating your filled questionnaire. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <SuccessView
        contact={contact}
        answers={answers}
        docxUrl={docxUrl}
        docxName={docxName}
        pdfUrl={pdfUrl}
        pdfName={pdfName}
      />
    );
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-inner">
          <div className="brand">
            <span className="brand-name">ALKEME</span>
            <span className="brand-tag">Insurance everything.</span>
          </div>
          <div className="eyebrow">Business Review Questionnaire</div>
          <h1 className="hero-title">
            Tell us about your business — so your ALKEME advisor can actually help.
          </h1>
          <p className="hero-sub">
            This 15-minute review covers HR, payroll, compliance, technology, Workers&apos; Comp, and strategic outlook.
            Your answers stay confidential and inform the options we bring back to you.
          </p>
          <div className="hero-meta">
            <span className="meta-chip">29 Questions</span>
            <span className="meta-chip">~15 Minutes</span>
            <span className="meta-chip">Confidential</span>
          </div>
        </div>
      </header>

      <ProgressBar step={step} totalSteps={totalSteps} pct={progressPct} answered={answeredCount} />

      <main>
        {step === STEP_CONTACT && (
          <ContactStep contact={contact} errors={errors} update={updateContact} />
        )}

        {step > 0 && step <= SECTIONS.length && (
          <SectionStep
            section={SECTIONS[step - 1]}
            answers={answers}
            updateAnswer={updateAnswer}
          />
        )}

        {step === STEP_REVIEW_OFFSET && (
          <ReviewStep contact={contact} answers={answers} submitError={submitError} />
        )}

        <div className="card-nav" style={{ maxWidth: 820, margin: '1.25rem auto 0' }}>
          <div className="nav-row">
            <button
              className="btn is-ghost"
              onClick={goBack}
              disabled={step === 0 || submitting}
            >
              ← Back
            </button>
            {step < totalSteps - 1 ? (
              <button className="btn" onClick={goNext}>
                Continue →
              </button>
            ) : (
              <button className="btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit review'}
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <strong>ALKEME Workforce Management Solutions</strong> · Confidential Prospect Information
      </footer>
    </div>
  );
}

function ProgressBar({ step, totalSteps, pct, answered }) {
  return (
    <div className="progress-bar-wrap">
      <div className="progress-inner">
        <div className="progress-meta">
          Step {step + 1} of {totalSteps}
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-meta" style={{ opacity: 0.8 }}>
          {answered}/{TOTAL_QUESTIONS} answered
        </div>
      </div>
    </div>
  );
}

function ContactStep({ contact, errors, update }) {
  return (
    <section className="card">
      <div className="section-eyebrow">Let&apos;s start with the basics</div>
      <h2 className="section-title">Contact Information</h2>
      <p className="section-sub">
        We&apos;ll use this to share your personalized recommendations after the review.
      </p>

      <div className="grid-2">
        {CONTACT_FIELDS.map((f) => (
          <div
            className="field"
            key={f.name}
            style={
              f.name === 'companyName' || f.name === 'email'
                ? { gridColumn: '1 / -1' }
                : undefined
            }
          >
            <label className="label" htmlFor={f.name}>
              {f.label}
              {f.required ? ' *' : ''}
            </label>
            <input
              id={f.name}
              className={`input ${errors[f.name] ? 'error' : ''}`}
              type={f.type}
              value={contact[f.name] || ''}
              onChange={(e) => update(f.name, e.target.value)}
              autoComplete={
                f.name === 'email'
                  ? 'email'
                  : f.name === 'phone'
                    ? 'tel'
                    : f.name === 'contactName'
                      ? 'name'
                      : 'off'
              }
            />
            {errors[f.name] && <div className="error-text">{errors[f.name]}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionStep({ section, answers, updateAnswer }) {
  return (
    <section className="card">
      <div className="section-eyebrow">
        {section.label} · {section.title}
      </div>
      <h2 className="section-title">{section.title}</h2>
      <p className="section-sub">{section.subtitle}</p>

      {section.questions.map((q) => (
        <QuestionField
          key={q.id}
          q={q}
          value={answers[q.id]}
          onChange={(v) => updateAnswer(q.id, v)}
        />
      ))}
    </section>
  );
}

function QuestionField({ q, value, onChange }) {
  return (
    <div className="field">
      <label className="label" htmlFor={q.id}>
        <span className="label-num">Q{q.n}</span>
        {q.prompt}
      </label>

      {q.type === 'textarea' && (
        <textarea
          id={q.id}
          className="textarea"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer…"
        />
      )}

      {q.type === 'rating' && (
        <div className="rating-wrap">
          <div className="rating-scale" role="radiogroup" aria-label={q.prompt}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={value === n}
                className={`rating-btn ${value === n ? 'active' : ''}`}
                onClick={() => onChange(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="rating-labels">
            <span>{q.lowLabel}</span>
            <span>{q.highLabel}</span>
          </div>
        </div>
      )}

      {q.type === 'radio' && (
        <div className="radio-row" role="radiogroup" aria-label={q.prompt}>
          {q.options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={value === opt}
              className={`radio-chip ${value === opt ? 'active' : ''}`}
              onClick={() => onChange(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewStep({ contact, answers, submitError }) {
  return (
    <section className="card">
      <div className="section-eyebrow">Almost done</div>
      <h2 className="section-title">Review your responses</h2>
      <p className="section-sub">
        Take a quick look before submitting. You can still go back to edit anything.
      </p>

      <div className="summary-group">
        <div className="summary-group-title">Contact Information</div>
        {CONTACT_FIELDS.map((f) => (
          <div key={f.name} className="summary-row">
            <div className="summary-q">{f.label}</div>
            <div className={`summary-a ${fieldIsEmpty(contact[f.name]) ? 'empty' : ''}`}>
              {fieldIsEmpty(contact[f.name]) ? 'Not provided' : contact[f.name]}
            </div>
          </div>
        ))}
      </div>

      {SECTIONS.map((sec) => (
        <div key={sec.id} className="summary-group">
          <div className="summary-group-title">
            {sec.label} · {sec.title}
          </div>
          {sec.questions.map((q) => (
            <div key={q.id} className="summary-row">
              <div className="summary-q">
                Q{q.n}. {q.prompt}
              </div>
              <div className={`summary-a ${fieldIsEmpty(answers[q.id]) ? 'empty' : ''}`}>
                {fieldIsEmpty(answers[q.id])
                  ? 'Skipped'
                  : q.type === 'rating'
                    ? `${answers[q.id]} / 10`
                    : String(answers[q.id])}
              </div>
            </div>
          ))}
        </div>
      ))}

      {submitError && (
        <div
          style={{
            background: '#fdecec',
            border: '1px solid #f5b1b1',
            color: '#9a2a2a',
            padding: '0.85rem 1rem',
            borderRadius: '0.6rem',
            fontSize: '0.9rem',
          }}
        >
          {submitError}
        </div>
      )}
    </section>
  );
}

function SuccessView({ contact, docxUrl, docxName, pdfUrl, pdfName }) {
  function triggerDownload(url, name) {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-inner">
          <div className="brand">
            <span className="brand-name">ALKEME</span>
            <span className="brand-tag">Insurance everything.</span>
          </div>
        </div>
      </header>
      <main>
        <div className="success-wrap">
          <div className="success-icon" aria-hidden="true">
            ✓
          </div>
          <h2 className="success-title">
            Thank you, {contact.contactName?.split(' ')[0] || 'there'}.
          </h2>
          <p className="success-body">
            Your responses for <strong>{contact.companyName}</strong> have been filled into the
            ALKEME Business Review Questionnaire. Download the completed file below — Word for
            easy edits, PDF for sharing as-is.
          </p>
          <div className="success-actions">
            <button
              className="btn"
              onClick={() => triggerDownload(docxUrl, docxName)}
              disabled={!docxUrl}
            >
              Download Word (.docx)
            </button>
            <button
              className="btn is-ghost"
              onClick={() => triggerDownload(pdfUrl, pdfName)}
              disabled={!pdfUrl}
            >
              Download PDF
            </button>
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '0.82rem', color: '#6b7684' }}>
            <code>{docxName}</code> · <code>{pdfName}</code>
          </p>
        </div>
      </main>
      <footer className="site-footer">
        <strong>ALKEME Workforce Management Solutions</strong> · Confidential Prospect Information
      </footer>
    </div>
  );
}
