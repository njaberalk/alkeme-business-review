/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build a self-contained standalone bundle — drop the .next/standalone
  // folder on any Node host and `node server.js` runs the whole app.
  output: 'standalone',
  // Ensure the docx template is copied into the server output; the fill
  // route reads it from disk at request time.
  outputFileTracingIncludes: {
    '/api/submit': ['./templates/**/*'],
  },
  // pdfkit resolves its built-in .afm font metric files relative to its own
  // source, so it must stay an ordinary node_modules import rather than being
  // bundled by webpack.
  serverExternalPackages: ['pdfkit'],
};

export default nextConfig;
