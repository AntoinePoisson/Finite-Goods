import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { render } from '../.ssr/entry-server.js';

const output = 'dist';
const index = join(output, 'index.html');
const clientHtml = readFileSync(index, 'utf8');
const stylesheet = clientHtml.match(/<link rel="stylesheet"[^>]+href="([^"]+\.css)">/);
if (!stylesheet) throw new Error('Could not find the generated stylesheet.');
const css = readFileSync(join(output, 'assets', basename(stylesheet[1])), 'utf8');

// The homepage is pre-rendered and its only stylesheet is inlined for the first paint.
const homeHtml = clientHtml
  .replace(stylesheet[0], `<style>${css}</style>`)
  .replace('<div id="root"></div>', `<div id="root">${render()}</div>`);
const slugs = [
  'emergency-spoon',
  'one-way-compass',
  'very-small-ladder',
  'last-matchbox',
  'ordinary-rock',
  'single-page-stapler'
];
const routes = [
  'operations',
  'back-office',
  'about',
  'how-it-work',
  'how-it-works',
  'stripe-return',
  ...slugs.map((slug) => `objects/${slug}`),
  ...slugs.map((slug) => `acquire/${slug}`)
];

writeFileSync(index, homeHtml);
for (const route of routes) {
  const directory = join(output, route);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'index.html'), clientHtml);
}

// GitHub Pages serves this file for unknown paths. React then renders the actual 404 page.
const notFoundHtml = clientHtml
  .replace(/<title>.*?<\/title>/, '<title>Not found — Finite Goods</title>')
  .replace('</head>', '    <meta name="robots" content="noindex">\n  </head>');
writeFileSync(join(output, '404.html'), notFoundHtml);
writeFileSync(join(output, '.nojekyll'), '');
writeFileSync(join(output, 'robots.txt'), 'User-agent: *\nAllow: /\n');
rmSync('.ssr', { recursive: true, force: true });
