export type ObjectKind = 'spoon' | 'compass' | 'ladder' | 'matchbox' | 'rock' | 'stapler';

export interface CatalogItem {
  id: string;
  slug: string;
  name: string;
  kind: ObjectKind;
  price: number;
  sku: string;
  serial: string;
  edition: string;
  description: string;
  provenance: string;
  material: string;
  condition: string;
  image: string;
  thumbnail: string;
  accent: string;
}

export const catalog: CatalogItem[] = [
  {
    id: 'spoon-001',
    slug: 'emergency-spoon',
    name: 'Emergency Spoon',
    kind: 'spoon',
    price: 32,
    sku: 'SPOON-001',
    serial: '000004',
    edition: '1/1',
    description: 'A spare spoon, kept for soup. The urgency, if there is any, has never been written down.',
    provenance: 'Set aside after a lunch that should not have needed a reserve.',
    material: 'Terracotta and warm ivory clay',
    condition: 'Ready',
    image: '/objects/emergency-spoon-720.avif',
    thumbnail: '/objects/emergency-spoon-360.avif',
    accent: '#d88b62'
  },
  {
    id: 'compass-001',
    slug: 'one-way-compass',
    name: 'One-Way Compass',
    kind: 'compass',
    price: 44,
    sku: 'COMPASS-001',
    serial: '000003',
    edition: '1/1',
    description: 'It points one way and stays there. We have not asked for a second reading.',
    provenance: 'Calibrated once, then left alone.',
    material: 'Terracotta, ivory and sage clay',
    condition: 'Fixed heading',
    image: '/objects/one-way-compass-720.avif',
    thumbnail: '/objects/one-way-compass-360.avif',
    accent: '#cf7b50'
  },
  {
    id: 'ladder-001',
    slug: 'very-small-ladder',
    name: 'Very Small Ladder',
    kind: 'ladder',
    price: 34,
    sku: 'LADDER-001',
    serial: '000002',
    edition: '1/1',
    description: 'Four rungs. Enough to reach the next shelf, and not much further.',
    provenance: 'Made for the shelf immediately above the lowest one.',
    material: 'Warm ivory clay',
    condition: 'Sound',
    image: '/objects/very-small-ladder-720.avif',
    thumbnail: '/objects/very-small-ladder-360.avif',
    accent: '#c8b79a'
  },
  {
    id: 'match-001',
    slug: 'last-matchbox',
    name: 'Last Matchbox',
    kind: 'matchbox',
    price: 28,
    sku: 'MATCH-001',
    serial: '000001',
    edition: '1/1',
    description: 'The last match is still in the box. That is the entire offer.',
    provenance: 'The rest of the box is not discussed.',
    material: 'Bone clay and one terracotta match',
    condition: 'Unstruck',
    image: '/objects/last-matchbox-720.avif',
    thumbnail: '/objects/last-matchbox-360.avif',
    accent: '#d29b76'
  },
  {
    id: 'rock-001',
    slug: 'ordinary-rock',
    name: 'Ordinary Rock',
    kind: 'rock',
    price: 24,
    sku: 'ROCK-001',
    serial: '000005',
    edition: '1/1',
    description: 'Ordinary, on purpose. The edition is still one.',
    provenance: 'Taken from a tray of nearly identical stones.',
    material: 'Hand-modelled stone clay',
    condition: 'As found',
    image: '/objects/ordinary-rock-960.avif',
    thumbnail: '/objects/ordinary-rock-480.jpg',
    accent: '#a8b193'
  },
  {
    id: 'stapler-001',
    slug: 'single-page-stapler',
    name: 'Single-Page Stapler',
    kind: 'stapler',
    price: 40,
    sku: 'STAPLE-001',
    serial: '000006',
    edition: '1/1',
    description: 'Built for a single sheet. Most pages will have no use for it.',
    provenance: 'Ordered when one loose page started to wander.',
    material: 'Sage, ivory and terracotta clay',
    condition: 'Unused',
    image: '/objects/single-page-stapler-720.avif',
    thumbnail: '/objects/single-page-stapler-360.avif',
    accent: '#91a59a'
  }
];

export function itemBySlug(slug: string) {
  return catalog.find((item) => item.slug === slug);
}

export function itemById(id: string) {
  return catalog.find((item) => item.id === id);
}

export function price(value: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
}
