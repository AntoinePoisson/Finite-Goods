import { appPath, sitePath } from '../src/infrastructure/routing';

describe('routing', () => {
  it('builds paths below the configured site base', () => {
    expect(sitePath('/back-office')).toMatch(/\/back-office$/);
    expect(appPath('/objects/a-stone')).toBe('/objects/a-stone');
  });
});
