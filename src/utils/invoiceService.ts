import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateInvoiceHtml } from './invoiceTemplate';
import { getNextInvoiceNumber } from '../db/orderRepository';
import { getInvoiceSettings } from '../db/settingsRepository';
import type { PortionType } from '../models/types';

interface InvoiceParams {
  customerName: string;
  customerPhone: string;
  slaughterDate: string;
  actualWeight: number;
  pricePerKg: number;
  portionType: PortionType;
}

export async function generateAndShareInvoice(params: InvoiceParams): Promise<void> {
  const isHalf = params.portionType === 'half';
  const billableWeight = isHalf ? params.actualWeight / 2 : params.actualWeight;
  const totalPrice = billableWeight * params.pricePerKg;
  const year = new Date(params.slaughterDate).getFullYear();
  const [invoiceNumber, settings] = await Promise.all([
    getNextInvoiceNumber(year),
    getInvoiceSettings(),
  ]);

  const html = generateInvoiceHtml({
    customerName: params.customerName,
    slaughterDate: params.slaughterDate,
    invoiceNumber,
    actualWeight: billableWeight,
    pricePerKg: params.pricePerKg,
    totalPrice,
    isHalf,
    settings,
  });

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Rechnung ${params.customerName}`,
  });
}
