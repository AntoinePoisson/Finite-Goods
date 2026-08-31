#!/usr/bin/env node

/**
 * Fails a deployment whose public HTML, route shells, static files or referenced assets are
 * unreachable. Run against the URL the hosting provider returned, once the deploy is live.
 *
 * A static build bakes its base path into every URL it emits, so this is the only check that
 * proves the deployed prefix matches the one the build was compiled with.
 */

const input = process.argv[2] || process.env.DEPLOYMENT_URL;
if (!input) {
  throw new Error('Pass the deployed site URL as the first argument or through DEPLOYMENT_URL.');
}

const siteUrl = new URL(input);
siteUrl.search = '';
siteUrl.hash = '';
siteUrl.pathname = `${siteUrl.pathname.replace(/\/+$/, '')}/`;

async function fetchText(url, expectedStatus = 200) {
  const response = await fetch(url, { redirect: 'follow' });
  if (response.status !== expectedStatus) {
    throw new Error(`${url} returned ${response.status}, expected ${expectedStatus}.`);
  }
  return response.text();
}

const home = await fetchText(siteUrl);

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
