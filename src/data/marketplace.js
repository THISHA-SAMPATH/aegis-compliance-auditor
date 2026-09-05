// Mock catalog a "shopping agent" evaluates against a user's mandate.
// Each product carries hidden signals (sponsored, margin, matchScore,
// priceHistory) that a real shopping agent has access to but a user does not.
// This is what Aegis's independent audit reads that the user never sees.

export const CATALOG = [
  {
    id: 'trailrunner-atlas',
    name: 'Atlas Trailrunner 2',
    brand: 'Northfield',
    category: 'trail-running-shoes',
    price: 129,
    priceHistory: [149, 149, 139, 129, 129],
    sponsored: false,
    merchantMargin: 0.22,
    matchScore: 0.94, // how well it actually fits the stated intent
    tags: ['waterproof', 'wide-fit', 'in-stock', 'ships-fri'],
  },
  {
    id: 'trailrunner-veloc',
    name: 'Veloc X Trail',
    brand: 'Peakline',
    category: 'trail-running-shoes',
    price: 145,
    priceHistory: [145, 145, 145, 145, 145],
    sponsored: true,
    merchantMargin: 0.41,
    matchScore: 0.71,
    tags: ['in-stock', 'ships-fri'],
  },
  {
    id: 'trailrunner-glide',
    name: 'Glide Ridge Runner',
    brand: 'Northfield',
    category: 'trail-running-shoes',
    price: 118,
    priceHistory: [118, 118, 112, 118, 118],
    sponsored: false,
    merchantMargin: 0.19,
    matchScore: 0.88,
    tags: ['in-stock', 'ships-mon'],
  },
  {
    id: 'trailrunner-summit',
    name: 'Summit Pro Trail',
    brand: 'Kaskade',
    category: 'trail-running-shoes',
    price: 149,
    priceHistory: [99, 99, 99, 149, 149],
    sponsored: true,
    merchantMargin: 0.38,
    matchScore: 0.65,
    tags: ['in-stock', 'ships-sat', 'fake-countdown-timer'],
  },
  {
    id: 'earbuds-aeropulse',
    name: 'AeroPulse Buds 2',
    brand: 'Sonora',
    category: 'wireless-earbuds',
    price: 129,
    priceHistory: [139, 139, 129, 129, 129],
    sponsored: false,
    merchantMargin: 0.21,
    matchScore: 0.95,
    tags: ['noise-cancelling', 'in-stock', 'ships-fri'],
  },
  {
    id: 'earbuds-sonicmax',
    name: 'SonicMax Pro',
    brand: 'Volt Audio',
    category: 'wireless-earbuds',
    price: 145,
    priceHistory: [145, 145, 145, 145, 145],
    sponsored: true,
    merchantMargin: 0.44,
    matchScore: 0.69,
    tags: ['in-stock', 'ships-fri'],
  },
  {
    id: 'earbuds-echoair',
    name: 'Echo Air Mini',
    brand: 'Sonora',
    category: 'wireless-earbuds',
    price: 99,
    priceHistory: [99, 99, 89, 99, 99],
    sponsored: false,
    merchantMargin: 0.18,
    matchScore: 0.84,
    tags: ['in-stock', 'ships-mon'],
  },
  {
    id: 'earbuds-pulseelite',
    name: 'Pulse Elite ANC',
    brand: 'Aura Sound',
    category: 'wireless-earbuds',
    price: 149,
    priceHistory: [99, 99, 99, 149, 149],
    sponsored: true,
    merchantMargin: 0.39,
    matchScore: 0.63,
    tags: ['in-stock', 'ships-fri', 'fake-countdown-timer'],
  },
  {
    id: 'desk-riseform',
    name: 'RiseForm Desk Converter',
    brand: 'Formwell',
    category: 'standing-desks',
    price: 129,
    priceHistory: [139, 139, 129, 129, 129],
    sponsored: false,
    merchantMargin: 0.2,
    matchScore: 0.93,
    tags: ['adjustable-height', 'in-stock', 'ships-fri'],
  },
  {
    id: 'desk-liftmax',
    name: 'LiftMax Pro Converter',
    brand: 'Workhaus',
    category: 'standing-desks',
    price: 145,
    priceHistory: [145, 145, 145, 145, 145],
    sponsored: true,
    merchantMargin: 0.42,
    matchScore: 0.7,
    tags: ['in-stock', 'ships-fri'],
  },
  {
    id: 'speaker-hearth',
    name: 'Hearth Mini Speaker',
    brand: 'Luma Home',
    category: 'smart-home-speakers',
    price: 89,
    priceHistory: [99, 99, 89, 89, 89],
    sponsored: false,
    merchantMargin: 0.18,
    matchScore: 0.9,
    tags: ['voice-control', 'in-stock', 'ships-fri'],
  },
  {
    id: 'speaker-nestwave',
    name: 'NestWave Plus',
    brand: 'Connecta',
    category: 'smart-home-speakers',
    price: 119,
    priceHistory: [119, 119, 119, 119, 119],
    sponsored: true,
    merchantMargin: 0.4,
    matchScore: 0.67,
    tags: ['in-stock', 'ships-mon'],
  },
  {
    id: 'backpack-waypoint',
    name: 'Waypoint Carry 28L',
    brand: 'Morrow',
    category: 'travel-backpacks',
    price: 139,
    priceHistory: [149, 149, 139, 139, 139],
    sponsored: false,
    merchantMargin: 0.2,
    matchScore: 0.92,
    tags: ['carry-on', 'in-stock', 'ships-fri'],
  },
  {
    id: 'backpack-roampro',
    name: 'Roam Pro Pack',
    brand: 'Atlas Supply',
    category: 'travel-backpacks',
    price: 149,
    priceHistory: [149, 149, 149, 149, 149],
    sponsored: true,
    merchantMargin: 0.43,
    matchScore: 0.68,
    tags: ['in-stock', 'ships-sat'],
  },
];

export const CATEGORIES = [...new Set(CATALOG.map((p) => p.category))].map(
  (value) => ({
    value,
    label: value
      .split('-')
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' '),
  }),
);

const DELIVERY_LABELS = {
  'ships-fri': 'Friday',
  'ships-mon': 'Monday',
  'ships-sat': 'Saturday',
};

export function createCategoryQuery(category, maxPrice, mustArriveBy) {
  const categoryLabel =
    CATEGORIES.find((item) => item.value === category)?.label || category;
  const arrivalLabel = DELIVERY_LABELS[mustArriveBy] || 'the selected date';
  return `${categoryLabel} under $${maxPrice} that arrive by ${arrivalLabel}`;
}

export const DEFAULT_INTENT = {
  category: CATEGORIES[0].value,
  query: createCategoryQuery(CATEGORIES[0].value, 150, 'ships-fri'),
  maxPrice: 150,
  mustArriveBy: 'ships-fri',
  preference: 'best overall match for the money',
  avoidSponsored: true,
  avoidPriceManipulation: true,
};

// Ready-made scenarios for quickly demonstrating different agent mandates.
// Each `intent` value deliberately follows the same shape as DEFAULT_INTENT.
export const INTENT_PRESETS = [
  {
    id: 'budget-shopper',
    label: 'Budget shopper',
    intent: {
      category: 'trail-running-shoes',
      query: createCategoryQuery('trail-running-shoes', 120, 'ships-mon'),
      maxPrice: 120,
      mustArriveBy: 'ships-mon',
      preference: 'best value within a firm budget',
      avoidSponsored: true,
      avoidPriceManipulation: true,
    },
  },
  {
    id: 'fast-delivery',
    label: 'Fast delivery priority',
    intent: {
      category: 'wireless-earbuds',
      query: createCategoryQuery('wireless-earbuds', 150, 'ships-fri'),
      maxPrice: 150,
      mustArriveBy: 'ships-fri',
      preference: 'fastest eligible delivery with a strong fit',
      avoidSponsored: false,
      avoidPriceManipulation: false,
    },
  },
  {
    id: 'brand-agnostic',
    label: 'Brand-agnostic, avoid sponsored',
    intent: {
      category: 'smart-home-speakers',
      query: createCategoryQuery('smart-home-speakers', 130, 'ships-fri'),
      maxPrice: 130,
      mustArriveBy: 'ships-fri',
      preference: 'best overall fit regardless of brand',
      avoidSponsored: true,
      avoidPriceManipulation: true,
    },
  },
  {
    id: 'travel-ready',
    label: 'Travel-ready essentials',
    intent: {
      category: 'travel-backpacks',
      query: createCategoryQuery('travel-backpacks', 145, 'ships-fri'),
      maxPrice: 145,
      mustArriveBy: 'ships-fri',
      preference: 'carry-on ready and dependable',
      avoidSponsored: true,
      avoidPriceManipulation: true,
    },
  },
];
