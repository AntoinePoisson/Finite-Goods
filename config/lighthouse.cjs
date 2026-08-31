const desktop = process.env.LIGHTHOUSE_DESKTOP === 'true';

// A GitHub Pages project site is served below /<repository> and the build bakes that prefix into
// every asset URL. Serving dist/ at the origin root would 404 each one and hand back a score of
// zero, so Lighthouse drives the same preview server the end-to-end specs use.
const basePath = (process.env.PAGES_BASE_PATH || '').replace(/^\/+|\/+$/g, '');
const url = `http://127.0.0.1:4173${basePath ? `/${basePath}` : ''}/`;

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm run preview --host 127.0.0.1',
      // Matched against the server's stdout. 'Local' rather than 'Local:' because Vite writes
      // an ANSI reset between the word and the colon whenever colour is enabled.
      startServerReadyPattern: 'Local',
      startServerReadyTimeout: 60000,
      url: [url],
      numberOfRuns: 3,
      settings: desktop
        ? {
            formFactor: 'desktop',
            screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1 },
            throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
            throttlingMethod: 'simulate'
          }
        : { formFactor: 'mobile', throttlingMethod: 'simulate' }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 1 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 1 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'total-blocking-time': ['error', { maxNumericValue: 50 }]
      }
    },
    upload: { target: 'filesystem', outputDir: './reports/lighthouse' }
  }
};
