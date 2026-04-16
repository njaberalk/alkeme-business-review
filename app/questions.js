export const CONTACT_FIELDS = [
  { name: 'companyName', label: 'Company Name', required: true, type: 'text' },
  { name: 'contactName', label: 'Contact Name', required: true, type: 'text' },
  { name: 'title', label: 'Title', required: false, type: 'text' },
  { name: 'email', label: 'Email Address', required: true, type: 'email' },
  { name: 'phone', label: 'Phone Number', required: false, type: 'tel' },
  { name: 'employees', label: '# of Employees', required: false, type: 'number' },
  { name: 'date', label: 'Date', required: false, type: 'date' },
];

export const SECTIONS = [
  {
    id: 'hr-payroll-benefits',
    label: 'Section 1',
    title: 'HR, Payroll & Benefits',
    subtitle:
      'How your team handles the day-to-day of people operations — the stuff that eats up calendars and inboxes.',
    questions: [
      {
        n: 1,
        id: 'q1',
        type: 'textarea',
        prompt:
          'How are HR, payroll, and benefits currently handled — internally, outsourced, or a mix?',
      },
      {
        n: 2,
        id: 'q2',
        type: 'textarea',
        prompt:
          'If you could wave a magic wand and fix one people-related issue this year, what would it be?',
      },
      {
        n: 3,
        id: 'q3',
        type: 'textarea',
        prompt:
          'How much time do you and your leadership team spend on employee-related admin each week?',
      },
      {
        n: 4,
        id: 'q4',
        type: 'textarea',
        prompt:
          'How are you currently running payroll, and how confident do you feel in accuracy and compliance?',
      },
    ],
  },
  {
    id: 'compliance-risk',
    label: 'Section 2',
    title: 'Compliance & Risk',
    subtitle:
      'Where regulatory exposure tends to hide — and how prepared your team is when questions arise.',
    questions: [
      {
        n: 5,
        id: 'q5',
        type: 'textarea',
        prompt: 'How often do payroll or tax-related issues come up?',
      },
      {
        n: 6,
        id: 'q6',
        type: 'textarea',
        prompt:
          'Are you operating in more than one state, or planning to in the near future?',
      },
      {
        n: 7,
        id: 'q7',
        type: 'textarea',
        prompt:
          'How do you handle wage & hour compliance, overtime rules, and paid leave requirements?',
      },
      {
        n: 8,
        id: 'q8',
        type: 'textarea',
        prompt:
          'When was the last time payroll or tax compliance caused stress for your team?',
      },
    ],
  },
  {
    id: 'hr-ops',
    label: 'Section 3',
    title: 'HR Operations & Support',
    subtitle:
      'Who handles the human side of the business — and how confident you feel when things escalate.',
    questions: [
      {
        n: 9,
        id: 'q9',
        type: 'textarea',
        prompt:
          'Who handles day-to-day HR issues like onboarding, terminations, and employee relations?',
      },
      {
        n: 10,
        id: 'q10',
        type: 'rating',
        prompt:
          'How confident are you that your policies and handbook are current and compliant?',
        lowLabel: '1 — Low / Not Confident',
        highLabel: '10 — High / Very Confident',
      },
      {
        n: 11,
        id: 'q11',
        type: 'textarea',
        prompt:
          'How do you handle performance management, discipline, and terminations today?',
      },
      {
        n: 12,
        id: 'q12',
        type: 'textarea',
        prompt:
          'What happens when an HR issue escalates — who does your team turn to?',
      },
    ],
  },
  {
    id: 'systems-tech',
    label: 'Section 4',
    title: 'Systems & Technology',
    subtitle:
      'The tools your team lives in every day — and whether they make running your business easier or harder.',
    questions: [
      {
        n: 13,
        id: 'q13',
        type: 'textarea',
        prompt: 'As you grow, do you see HR becoming more or less manageable?',
      },
      {
        n: 14,
        id: 'q14',
        type: 'textarea',
        prompt:
          'What systems are you using today for payroll, benefits, HR, and time tracking?',
      },
      {
        n: 15,
        id: 'q15',
        type: 'textarea',
        prompt:
          'Are your payroll, benefits, and HR platforms integrated? How well do they talk to each other?',
      },
      {
        n: 16,
        id: 'q16',
        type: 'rating',
        prompt:
          'How easy is it for employees to access paystubs, benefits, PTO, and documents?',
        lowLabel: '1 — Difficult',
        highLabel: '10 — Very Easy',
      },
      {
        n: 17,
        id: 'q17',
        type: 'textarea',
        prompt:
          'Do managers have the tools they need to manage their teams effectively?',
      },
      {
        n: 18,
        id: 'q18',
        type: 'radio',
        prompt:
          'If you could simplify your tech stack into one platform, would that be appealing?',
        options: ['Yes', 'No', 'Unsure'],
      },
    ],
  },
  {
    id: 'workers-comp',
    label: 'Section 5',
    title: "Workers' Comp & Workplace Safety",
    subtitle:
      'Claims, audits, and safety culture — the inputs that drive your premiums over time.',
    questions: [
      {
        n: 19,
        id: 'q19',
        type: 'textarea',
        prompt:
          "How are you currently managing workers' comp and workplace safety?",
      },
      {
        n: 20,
        id: 'q20',
        type: 'textarea',
        prompt: 'Have you experienced any claims or audits in the last few years?',
      },
      {
        n: 21,
        id: 'q21',
        type: 'textarea',
        prompt:
          "Are your Workers' Comp costs mostly consistent year over year, or have you experienced volatility?",
      },
      {
        n: 22,
        id: 'q22',
        type: 'textarea',
        prompt: 'Do you have a formal safety program or training in place?',
      },
      {
        n: 23,
        id: 'q23',
        type: 'textarea',
        prompt: 'Would risk sharing and claims support be valuable to your business?',
      },
    ],
  },
  {
    id: 'strategic',
    label: 'Section 6',
    title: 'Strategic & Financial Outlook',
    subtitle:
      'How HR and insurance fit into the bigger picture — and where you see opportunity to reinvest.',
    questions: [
      {
        n: 24,
        id: 'q24',
        type: 'textarea',
        prompt: 'How do employee-related costs impact your overall profitability?',
      },
      {
        n: 25,
        id: 'q25',
        type: 'textarea',
        prompt: 'Do you see HR as a necessary expense or a strategic advantage?',
      },
      {
        n: 26,
        id: 'q26',
        type: 'textarea',
        prompt: 'How important is scalability as you plan for growth?',
      },
      {
        n: 27,
        id: 'q27',
        type: 'textarea',
        prompt:
          'If you could offload administrative burden and reduce risk, where would you reinvest that time or money?',
      },
      {
        n: 28,
        id: 'q28',
        type: 'textarea',
        prompt: 'Who is the final decision maker within your organization?',
      },
      {
        n: 29,
        id: 'q29',
        type: 'rating',
        prompt:
          "On a scale of 1–10, what is your overall appetite to explore options for Workers' Comp, P&C coverages, and HR/Benefits support?",
        lowLabel: '1 — Low appetite',
        highLabel: '10 — High appetite',
      },
    ],
  },
];

export const TOTAL_QUESTIONS = SECTIONS.reduce(
  (acc, s) => acc + s.questions.length,
  0,
);
