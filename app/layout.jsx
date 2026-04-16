import './globals.css';

export const metadata = {
  title: 'ALKEME | Business Review Questionnaire',
  description:
    'A 15-minute review to help your ALKEME advisor understand your workforce, HR, compliance, and benefits landscape.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
