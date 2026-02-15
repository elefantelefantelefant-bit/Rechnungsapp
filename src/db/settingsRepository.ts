import { getDatabase } from './database';

export interface InvoiceSettings {
  productName: string;
  footerNote: string;
  closingText: string;
  thanksText: string;
}

const DEFAULTS: InvoiceSettings = {
  productName: 'Weihnachtspute',
  footerNote: 'Bitte beachten Sie, dass die kompostierbaren Säcke nicht zum Einfrieren geeignet sind.',
  closingText: 'Wir wünschen ein frohes Weihnachtsfest und einen guten Rutsch ins neue Jahr!',
  thanksText: 'Vielen Dank für Ihr Vertrauen!',
};

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}

export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    "SELECT key, value FROM settings WHERE key IN ('productName', 'footerNote', 'closingText', 'thanksText')"
  );
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    productName: map.get('productName') ?? DEFAULTS.productName,
    footerNote: map.get('footerNote') ?? DEFAULTS.footerNote,
    closingText: map.get('closingText') ?? DEFAULTS.closingText,
    thanksText: map.get('thanksText') ?? DEFAULTS.thanksText,
  };
}

export async function saveInvoiceSettings(settings: InvoiceSettings): Promise<void> {
  const entries = Object.entries(settings) as [string, string][];
  for (const [key, value] of entries) {
    await setSetting(key, value);
  }
}

export { DEFAULTS as INVOICE_DEFAULTS };
