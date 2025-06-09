export const months = [
  'Zephyr', 'Blossom', 'Cinder', 'Dusk', 'Ember',
  'Frost', 'Gale', 'Hearth', 'Ivory', 'Jade',
  'Kismet', 'Lumen', 'Morrow', 'Nexus', 'Omen',
  'Pyre', 'Quell', 'Riven', 'Solace', 'Thorn',
  'Umbra', 'Vale', 'Whisper', 'Xenith', 'Yield'
];

export function formatHour(hour, use12=false) {
  if (use12) {
    const h = ((hour % 12) || 12);
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:00 ${ampm}`;
  }
  const h = hour.toString().padStart(2, '0');
  return `${h}:00`;
}
