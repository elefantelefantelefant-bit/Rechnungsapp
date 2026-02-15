import { formatDateLongDE } from './formatters';
import { LOGO_BASE64 } from '../assets/logoBase64';
import type { InvoiceSettings } from '../db/settingsRepository';

interface InvoiceData {
  customerName: string;
  slaughterDate: string; // ISO format YYYY-MM-DD
  invoiceNumber: string;
  actualWeight: number;
  pricePerKg: number;
  totalPrice: number;
  isHalf?: boolean;
  settings: InvoiceSettings;
}

export function generateInvoiceHtml(data: InvoiceData): string {
  const {
    customerName,
    slaughterDate,
    invoiceNumber,
    actualWeight,
    pricePerKg,
    totalPrice,
    isHalf = false,
    settings,
  } = data;

  const formattedDate = formatDateLongDE(slaughterDate);
  const weightStr = actualWeight.toFixed(2).replace('.', ',');
  const priceStr = pricePerKg.toFixed(2).replace('.', ',');
  const totalStr = totalPrice.toFixed(2).replace('.', ',');

  const productLabel = isHalf
    ? `${settings.productName} (halbe)`
    : settings.productName;
  const quantity = isHalf ? '1/2' : '1';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    @page {
      margin: 0;
      size: A4;
    }
    body {
      font-family: 'Times New Roman', Times, Georgia, serif;
      margin: 0;
      padding: 50px 60px;
      color: #000;
      font-size: 14px;
      line-height: 1.4;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0;
    }
    .header-left {
      flex: 1;
    }
    .header-left h1 {
      font-size: 26px;
      margin: 0;
      font-weight: bold;
    }
    .header-left p {
      margin: 2px 0;
      font-size: 13px;
    }
    .header-right {
      width: 160px;
    }
    .header-right img {
      width: 160px;
      height: auto;
    }
    .separator {
      border: none;
      border-top: 3px solid #B8860B;
      margin: 15px 0 30px 0;
    }
    .customer {
      font-size: 16px;
      margin-bottom: 30px;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
    }
    .invoice-header h2 {
      font-size: 22px;
      margin: 0;
      font-weight: bold;
    }
    .invoice-meta {
      text-align: right;
      font-size: 13px;
      line-height: 1.6;
    }
    .invoice-meta span.label {
      display: inline-block;
      min-width: 100px;
      text-align: left;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 5px;
    }
    th {
      border-top: 2px solid #000;
      border-bottom: 1px solid #000;
      padding: 8px 10px;
      text-align: left;
      font-size: 13px;
      font-weight: bold;
    }
    th.right, td.right {
      text-align: right;
    }
    td {
      padding: 8px 10px;
      font-size: 14px;
      border-bottom: 1px solid #ccc;
    }
    .total-row td {
      font-weight: bold;
      font-size: 15px;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      padding-top: 10px;
      padding-bottom: 10px;
    }
    .footer {
      margin-top: 50px;
      font-size: 13px;
      line-height: 1.8;
    }
    .footer p {
      margin: 0;
    }
    .footer .closing {
      margin-top: 25px;
      font-style: italic;
    }
    .footer .family {
      margin-top: 5px;
      font-weight: bold;
      font-style: italic;
    }
    .bottom-info {
      margin-top: 50px;
      font-size: 12px;
      border-top: 1px solid #999;
      padding-top: 10px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>Freilandpute Achleitner</h1>
      <p>Gro\u00DFendorf 8 | 4551 Ried im Traunkreis</p>
      <p>Tel. 0699 12 90 34 94 | E-Mail: office@freilandpute-achleitner.at</p>
      <p>www.freilandpute-achleitner.at</p>
    </div>
    <div class="header-right">
      <img src="${LOGO_BASE64}" alt="Logo" />
    </div>
  </div>

  <hr class="separator">

  <div class="customer">
    Fam. ${customerName}
  </div>

  <div class="invoice-header">
    <h2>Rechnung</h2>
    <div class="invoice-meta">
      <span class="label">Datum:</span> ${formattedDate}<br>
      <span class="label">RechNr.:</span> ${invoiceNumber}<br>
      <span class="label">Zahlungsart:</span> bar
    </div>
  </div>

  <table>
    <tr>
      <th>Menge</th>
      <th>Bezeichnung</th>
      <th class="right">Gewicht in kg</th>
      <th class="right">Preis pro kg in \u20AC</th>
      <th class="right">Gesamt</th>
    </tr>
    <tr>
      <td>${quantity}</td>
      <td>${productLabel}</td>
      <td class="right">${weightStr}</td>
      <td class="right">${priceStr}</td>
      <td class="right">${totalStr}</td>
    </tr>
    <tr class="total-row">
      <td colspan="4">Endbetrag</td>
      <td class="right">${totalStr} \u20AC</td>
    </tr>
  </table>

  <div class="footer">
    <p>${settings.footerNote}</p>
    <p class="closing">${settings.closingText}</p>
    <p class="closing">${settings.thanksText}</p>
    <p class="family">Familie Achleitner</p>
  </div>

  <div class="bottom-info">
    <p>Preise inkl. 10% Mehrwertsteuer</p>
    <p>Bankverbindung: IBAN AT97 3438 0000 0760 3459</p>
  </div>
</body>
</html>`;
}
