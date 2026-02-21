import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const output = 'dist';
// TODO: drop how-it-work once nothing still links the typo slug
const expectedFiles = [
  'index.html',
  '404.html',
  '.nojekyll',
  'humans.txt',
  'llms.txt',
  'operations/index.html',
  'back-office/index.html',
  'about/index.html',
  'how-it-work/index.html',
  'how-it-works/index.html',
  'objects/ordinary-rock/index.html'
];

const missing = expectedFiles.filter((file) => !existsSync(join(output, file)));
if (missing.length > 0) {
  throw new Error(`Incomplete production build: ${missing.join(', ')}`);
}

const home = readFileSync(join(output, 'index.html'), 'utf8');
const notFound = readFileSync(join(output, '404.html'), 'utf8');

if (!home.includes('One object.')) throw new Error('The homepage was not pre-rendered.');
if (!notFound.includes('name="robots" content="noindex"')) {
  throw new Error('The 404 page must not be indexed.');
}
