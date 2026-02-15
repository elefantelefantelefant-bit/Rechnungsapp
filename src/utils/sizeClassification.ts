import type { SizePreference, Turkey } from '../models/types';

export interface SizeRange {
  min: number;
  max: number;
}

export interface SizeRanges {
  light: SizeRange;
  medium: SizeRange;
  heavy: SizeRange;
}

export const SIZE_LABELS: Record<SizePreference, string> = {
  light: 'Leicht',
  medium: 'Mittel',
  heavy: 'Schwer',
};

export const PORTION_LABELS: Record<string, string> = {
  whole: 'Ganz',
  half: 'Halb',
};

export function calculateSizeRanges(turkeys: Turkey[]): SizeRanges | null {
  if (turkeys.length === 0) return null;

  const sorted = [...turkeys].sort((a, b) => a.actual_weight - b.actual_weight);
  const n = sorted.length;

  if (n < 3) {
    // With fewer than 3 turkeys, use equal splits of the weight range
    const min = sorted[0].actual_weight;
    const max = sorted[n - 1].actual_weight;
    const third = (max - min) / 3;
    return {
      light: { min, max: min + third },
      medium: { min: min + third, max: min + 2 * third },
      heavy: { min: min + 2 * third, max },
    };
  }

  const lightEnd = Math.ceil(n / 3);
  const mediumEnd = Math.ceil((2 * n) / 3);

  return {
    light: { min: sorted[0].actual_weight, max: sorted[lightEnd - 1].actual_weight },
    medium: { min: sorted[lightEnd].actual_weight, max: sorted[mediumEnd - 1].actual_weight },
    heavy: { min: sorted[mediumEnd].actual_weight, max: sorted[n - 1].actual_weight },
  };
}

export function classifyTurkey(weight: number, ranges: SizeRanges): SizePreference {
  if (weight <= ranges.light.max) return 'light';
  if (weight <= ranges.medium.max) return 'medium';
  return 'heavy';
}

export function getTurkeysForSizePreference(
  turkeys: Turkey[],
  ranges: SizeRanges,
  preference: SizePreference
): Turkey[] {
  return turkeys.filter((t) => classifyTurkey(t.actual_weight, ranges) === preference);
}

export function formatSizeRanges(ranges: SizeRanges): string {
  const fmt = (n: number) => n.toFixed(1).replace('.', ',');
  return `Leicht: ≤ ${fmt(ranges.light.max)} kg | Mittel: ${fmt(ranges.medium.min)}–${fmt(ranges.medium.max)} kg | Schwer: ≥ ${fmt(ranges.heavy.min)} kg`;
}
