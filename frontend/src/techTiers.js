export const techTiers = [
  'Stone Age',
  'Bronze Age',
  'Iron Age',
  'Industrial Age',
  'Modern Age',
  'Futuristic Age'
];

export function tierName(tier) {
  return techTiers[tier - 1] || `Tier ${tier}`;
}
