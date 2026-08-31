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
    description: 'A dedicated spoon for soup situations of unspecified urgency.',
    provenance: 'Placed on standby after an entirely preventable lunchtime incident.',
    material: 'Terracotta and warm ivory clay',
    condition: 'Ready when required',
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
    description: 'Points confidently in one direction. Accuracy has not been independently verified.',
    provenance: 'Calibrated once, then politely asked not to reconsider.',
    material: 'Terracotta, ivory and sage clay',
    condition: 'Decisively oriented',
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
    description: 'Four perfectly sound rungs for ambitions of a very modest height.',
    provenance: 'Built to reach the shelf immediately above the smallest shelf.',
    material: 'Warm ivory clay',
    condition: 'Structurally optimistic',
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
    description: 'One box, one match, and no pressure whatsoever.',
    provenance: 'The other matches have declined to comment on their whereabouts.',
    material: 'Bone clay and one terracotta match',
    condition: 'Decisive',
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
    description: 'A perfectly ordinary rock. There will never be another one exactly like it.',
    provenance: 'Selected from a very competitive field of otherwise ordinary candidates.',
    material: 'Hand-modelled stone clay',
    condition: 'Unreasonably good',
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
    description: 'A stapler engineered for the one page that least needs stapling.',
    provenance: 'Commissioned after a loose page briefly considered going elsewhere.',
    material: 'Sage, ivory and terracotta clay',
    condition: 'Excessively prepared',
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
