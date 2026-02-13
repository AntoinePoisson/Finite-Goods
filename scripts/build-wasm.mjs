import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const output = 'public/wasm';
mkdirSync(output, { recursive: true });

// keep go caches inside the repo so CI doesnt fill $HOME
mkdirSync('.cache/go-build', { recursive: true });
mkdirSync('.cache/go-mod', { recursive: true });

const build = spawnSync(
  'go',
  ['build', '-trimpath', '-ldflags=-s -w', '-o', `${output}/engine.wasm`, './cmd/wasm'],
  {
    env: {
      ...process.env,
      GOOS: 'js',
      GOARCH: 'wasm',
      GOCACHE: join(process.cwd(), '.cache/go-build'),
      GOMODCACHE: join(process.cwd(), '.cache/go-mod')
    },
    stdio: 'inherit'
  }
);
if (build.status !== 0) process.exit(build.status ?? 1);

const goRoot = spawnSync('go', ['env', 'GOROOT'], { encoding: 'utf8' }).stdout.trim();
// Go 1.24 moved this, keep both paths around for a bit
const candidates = [join(goRoot, 'lib/wasm/wasm_exec.js'), join(goRoot, 'misc/wasm/wasm_exec.js')];
const runtime = candidates.find(existsSync);
if (!runtime) throw new Error('Could not find wasm_exec.js in GOROOT');

cpSync(runtime, `${output}/wasm_exec.js`);
