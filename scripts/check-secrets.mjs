import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const scanAll = process.argv.includes('--all');
const gitArgs = scanAll ? ['ls-files'] : ['diff', '--cached', '--name-only', '--diff-filter=ACMR'];
const files = execFileSync('git', gitArgs, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

// leftover path from an earlier scaffold, ignore it if it ever comes back
const ignored = /^(React-Production-Starter\/|pnpm-lock\.yaml$)|\.(avif|gif|ico|jpe?g|png|wasm|woff2?)$/i;
const checks = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['GitHub token', /gh[pousr]_[A-Za-z0-9_]{30,}/],
  ['AWS access key', /AKIA[0-9A-Z]{16}/],
  ['Stripe secret key', /sk_(?:live|test)_[A-Za-z0-9]{20,}/]
  // TODO: add slack tokens if i ever wire a webhook
];

const findings = [];
for (const file of files) {
  if (ignored.test(file)) continue;

  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  for (const [label, pattern] of checks) {
    if (pattern.test(content)) findings.push(`${file}: possible ${label}`);
  }
}

if (findings.length > 0) {
  console.error(findings.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Secret scan passed (${files.length} files considered).`);
}
