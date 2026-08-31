import { catalog, itemById, itemBySlug, price } from '../src/domain/catalog';

describe('catalog', () => {
  it('keeps stable unique identifiers and slugs', () => {
    expect(new Set(catalog.map((item) => item.id)).size).toBe(catalog.length);
    expect(new Set(catalog.map((item) => item.slug)).size).toBe(catalog.length);
    expect(itemBySlug('ordinary-rock')?.id).toBe('rock-001');
    expect(itemById('rock-001')?.kind).toBe('rock');
  });

  it('formats prices in euros', () => {
    expect(price(24)).toContain('24');
    expect(price(24)).toContain('€');
  });
});
