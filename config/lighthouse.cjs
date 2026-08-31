const desktop = process.env.LIGHTHOUSE_DESKTOP === 'true';

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['/'],
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
