import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateInvoiceHtml } from './invoiceTemplate';

interface InvoiceParams {
  customerName: string;
  customerPhone: string;
  slaughterDate: string;
  actualWeight: number;
  pricePerKg: number;
}

export async function generateAndShareInvoice(params: InvoiceParams): Promise<void> {
  const totalPrice = params.actualWeight * params.pricePerKg;

  const html = generateInvoiceHtml({
    ...params,
    totalPrice,
  });

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Rechnung ${params.customerName}`,
  });
}
