export function formatEuro(amount: number): string {
  return amount.toFixed(2).replace('.', ',') + ' €';
}

export function formatKg(weight: number): string {
  return weight.toFixed(1).replace('.', ',') + ' kg';
}

export function formatDateDE(isoDate: string): string {
  return isoDate.split('-').reverse().join('.');
}
