export function formatEuro(amount: number): string {
  return amount.toFixed(2).replace('.', ',') + ' €';
}

export function formatKg(weight: number): string {
  return weight.toFixed(1).replace('.', ',') + ' kg';
}

export function formatDateDE(isoDate: string): string {
  return isoDate.split('-').reverse().join('.');
}

const GERMAN_MONTHS = [
  'Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

export function formatDateLongDE(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${parseInt(day, 10)}. ${GERMAN_MONTHS[parseInt(month, 10) - 1]} ${year}`;
}
