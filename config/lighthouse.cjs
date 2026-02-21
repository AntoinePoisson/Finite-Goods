const desktop = process.env.LIGHTHOUSE_DESKTOP === 'true';

// same base path as the build, otherwise every asset 404s and scores tank
const basePath = (process.env.PAGES_BASE_PATH || '').replace(/^\/+|\/+$/g, '');
const url = `http://127.0.0.1:4173${basePath ? `/${basePath}` : ''}/`;

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm run preview --host 127.0.0.1',
      // Vite may insert an ANSI reset before the colon.
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
        // TODO: 1.0 is harsh, drop to 0.95 if a chrome update tanks us
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
