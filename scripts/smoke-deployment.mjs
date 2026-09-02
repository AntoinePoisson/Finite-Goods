#!/usr/bin/env node

/**
 * Fails a deployment whose public HTML, route shells, static files or referenced assets are
 * unreachable. Run against the URL the hosting provider returned, once the deploy is live.
 *
 * A static build bakes its base path into every URL it emits, so this is the only check that
 * proves the deployed prefix matches the one the build was compiled with.
 */

import { readFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';

const input = process.argv[2] || process.env.DEPLOYMENT_URL;
if (!input) {
  throw new Error('Pass the deployed site URL as the first argument or through DEPLOYMENT_URL.');
}

const siteUrl = new URL(input);
siteUrl.search = '';
siteUrl.hash = '';
siteUrl.pathname = `${siteUrl.pathname.replace(/\/+$/, '')}/`;

// The host accepts an upload seconds before its CDN serves it, so for a short while the URL still
// answers with the deployment being replaced, and every assertion below would then be read against
// the wrong site. The entry bundle carries a content hash, which makes it the cheapest proof that
// the bytes on the wire are the ones this run built.
const PROPAGATION_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 3_000;
const ENTRY_SCRIPT = /<script[^>]+src=["'][^"']*?(assets\/[^"'/]+\.js)["']/i;

async function fetchText(url, expectedStatus = 200) {
  const response = await fetch(url, { redirect: 'follow' });
  if (response.status !== expectedStatus) {
    throw new Error(`${url} returned ${response.status}, expected ${expectedStatus}.`);
  }
  return response.text();
}

// Undefined when no build sits next to this script, which is the case when the smoke test is
// pointed at an already-live site by hand. The wait is then skipped rather than guessed at.
async function builtEntryScript() {
  try {
    const built = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
    return built.match(ENTRY_SCRIPT)?.[1];
  } catch {
    return undefined;
  }
}

async function fetchPublishedHome() {
  const expected = await builtEntryScript();
  if (!expected) return fetchText(siteUrl);

  const deadline = Date.now() + PROPAGATION_TIMEOUT_MS;
  let lastFailure = 'the homepage was never served';
  for (;;) {
    const home = await fetchText(siteUrl).catch((error) => {
      lastFailure = error.message;
      return undefined;
    });
    if (home?.includes(expected)) return home;
    if (home) lastFailure = `the homepage does not reference ${expected}`;
    if (Date.now() >= deadline) {
      throw new Error(
        `The site never served this build within ${PROPAGATION_TIMEOUT_MS / 1000}s: ${lastFailure}. ` +
          'A second publisher overwriting the same site is the usual cause.'
      );
    }
    await sleep(POLL_INTERVAL_MS);
  }
}

const home = await fetchPublishedHome();

if (home.toLowerCase().includes('localhost')) {
  throw new Error('The deployed HTML still points at localhost.');
}
if (!home.includes('One object.')) {
  throw new Error('The homepage was served without its pre-rendered markup.');
}

// Every same-origin script, stylesheet, icon, manifest and preload the homepage declares. A base
// path mismatch shows up here first, as a wall of 404s.
const referenced = [...home.matchAll(/<(?:script|link)[^>]+(?:src|href)=["']([^"']+)["']/gi)]
  .map((match) => new URL(match[1], siteUrl))
  .filter((url) => url.origin === siteUrl.origin);

for (const url of new Map(referenced.map((url) => [url.href, url])).values()) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Referenced asset ${url} returned ${response.status}.`);
}

// The Go engine is fetched by a worker rather than by the document, so no markup references it.
const engine = await fetch(new URL('wasm/engine.wasm', siteUrl));
if (!engine.ok) throw new Error(`The WebAssembly engine returned ${engine.status}.`);
if (engine.headers.get('content-type') !== 'application/wasm') {
  throw new Error(`The engine is served as ${engine.headers.get('content-type')}, not application/wasm.`);
}

// A route shell proves the pre-rendered directories survived the upload.
const objectPage = await fetchText(new URL('objects/ordinary-rock', siteUrl));
if (!objectPage.includes('<div id="root">')) {
  throw new Error('The object route was not deployed as its own HTML shell.');
}

const robots = await fetchText(new URL('robots.txt', siteUrl));
if (!robots.includes('User-agent: *')) throw new Error('robots.txt is not the one the build emits.');

const notFound = await fetchText(new URL('__deployment-smoke__', siteUrl), 404);
if (!/name="robots" content="noindex"/i.test(notFound)) {
  throw new Error('The deployed 404 page is indexable.');
}

console.info(`✓ deployment smoke passed: ${siteUrl}`);
