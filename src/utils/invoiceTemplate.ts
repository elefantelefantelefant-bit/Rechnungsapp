import { formatEuro, formatKg, formatDateDE } from './formatters';

interface InvoiceData {
  customerName: string;
  customerPhone: string;
  slaughterDate: string; // ISO format YYYY-MM-DD
  actualWeight: number;
  pricePerKg: number;
  totalPrice: number;
}

export function generateInvoiceHtml(data: InvoiceData): string {
  const {
    customerName,
    customerPhone,
    slaughterDate,
    actualWeight,
    pricePerKg,
    totalPrice,
  } = data;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #6D4C41;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #6D4C41;
      margin: 0;
      font-size: 28px;
    }
    .header p {
      color: #8D6E63;
      margin: 5px 0 0;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: #6D4C41;
      font-size: 16px;
      border-bottom: 1px solid #D7CCC8;
      padding-bottom: 5px;
    }
    .customer-info p {
      margin: 4px 0;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background-color: #6D4C41;
      color: white;
      padding: 10px 12px;
      text-align: left;
      font-size: 13px;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #D7CCC8;
      font-size: 14px;
    }
    .total-row td {
      font-weight: bold;
      font-size: 16px;
      border-top: 2px solid #6D4C41;
      border-bottom: none;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #8D6E63;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Musterhof</h1>
    <p>Rechnung</p>
  </div>

  <div class="section customer-info">
    <h2>Kunde</h2>
    <p><strong>${customerName}</strong></p>
    ${customerPhone ? `<p>Tel: ${customerPhone}</p>` : ''}
  </div>

  <div class="section">
    <h2>Schlachtung vom ${formatDateDE(slaughterDate)}</h2>
    <table>
      <tr>
        <th>Beschreibung</th>
        <th style="text-align:right">Menge</th>
        <th style="text-align:right">Preis/kg</th>
        <th style="text-align:right">Betrag</th>
      </tr>
      <tr>
        <td>Truthahn</td>
        <td style="text-align:right">${formatKg(actualWeight)}</td>
        <td style="text-align:right">${formatEuro(pricePerKg)}</td>
        <td style="text-align:right">${formatEuro(totalPrice)}</td>
      </tr>
      <tr class="total-row">
        <td colspan="3">Gesamtbetrag</td>
        <td style="text-align:right">${formatEuro(totalPrice)}</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p>Vielen Dank für Ihren Einkauf!</p>
  </div>
</body>
</html>`;
}
