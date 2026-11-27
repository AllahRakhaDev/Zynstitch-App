import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { IMeasurement } from '@/types/measurements.types';

/** The PDF is English-only, like Tailor-Track's. */
const PDF = {
  title: 'Measurements',
  generatedOn: 'Generated On',
  customerName: 'Customer',
  phone: 'Phone',
  measurementName: 'Measurement Name',
  measurementDate: 'Measurement Date',
  measurementTitle: 'Measurement Details',
  designTitle: 'Design & Customization',
  notes: 'Notes',
  yes: 'Yes',
  no: 'No',
  fields: {
    kameezLength: 'Kameez Length',
    sleeveLength: 'Sleeve',
    shoulderWidth: 'Shoulder',
    neck: 'Neck',
    chest: 'Chest',
    waist: 'Waist',
    bottomWidth: 'Bottom Width',
    shalwarLength: 'Shalwar',
    bottomOpening: 'Bottom Opening',
    cuff: 'Cuff',
    collarStyle: 'Collar / Ban',
    hasChakPattiKaaj: 'Chak Patti Kaaj',
    hasChestPocket: 'Chest Pocket',
    hasSidePockets: 'Side Pockets',
    hasShalwarPocket: 'Shalwar Pocket',
  },
  collarStyles: {
    noCollar: 'No Collar',
    collar: 'Collar',
    ban: 'Ban',
    other: 'Other',
  } as Record<string, string>,
} as const;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const text = (value: unknown) =>
  value === undefined || value === null || value === '' ? '-' : escapeHtml(String(value));

const yesNo = (value?: boolean) => (value === true ? PDF.yes : value === false ? PDF.no : '-');

const formatDate = (value?: string | Date) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const row = (l1: string, v1: string, l2 = '', v2 = '') =>
  `<tr><th>${l1}${l1 ? ':' : ''}</th><td>${v1}</td><th>${l2}${l2 ? ':' : ''}</th><td>${l2 ? v2 : ''}</td></tr>`;

export function buildMeasurementHtml(m: IMeasurement, companyName: string) {
  const f = PDF.fields;
  const collar = m.collarStyle ? (PDF.collarStyles[m.collarStyle] ?? m.collarStyle) : '-';
  return `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  body { font-family: Helvetica, Arial, sans-serif; color: #212121; margin: 0; font-size: 12px; }
  header { background: #1565c0; color: #fff; padding: 18px 28px; display: flex; justify-content: space-between; }
  header h1 { margin: 0; font-size: 20px; }
  header p { margin: 4px 0 0; font-size: 12px; }
  main { padding: 16px 28px 48px; }
  h2 { color: #009688; font-size: 13px; border-bottom: 1px solid #e0e0e0; padding-bottom: 3px; margin: 18px 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; color: #555; width: 25%; padding: 5px 4px; font-weight: 700; }
  td { width: 25%; padding: 5px 4px; }
  .notes { white-space: pre-wrap; padding: 6px 4px; }
  footer { position: fixed; bottom: 14px; left: 28px; color: #555; font-size: 10px; }
</style></head>
<body>
  <header>
    <div><h1>${text(companyName)}</h1><p>${PDF.title}</p></div>
    <p>${PDF.generatedOn}: ${formatDate(new Date())}</p>
  </header>
  <main>
    <table>
      ${row(PDF.customerName, text(m.customerName), PDF.phone, text(m.customerPhone))}
      ${row(PDF.measurementName, text(m.measurementName), PDF.measurementDate, formatDate(m.measurementDate))}
    </table>
    <h2>${PDF.measurementTitle}</h2>
    <table>
      ${row(f.kameezLength, text(m.kameezLength), f.sleeveLength, text(m.sleeveLength))}
      ${row(f.shoulderWidth, text(m.shoulderWidth), f.neck, text(m.neck))}
      ${row(f.chest, text(m.chest), f.waist, text(m.waist))}
      ${row(f.bottomWidth, text(m.bottomWidth), f.shalwarLength, text(m.shalwarLength))}
      ${row(f.bottomOpening, text(m.bottomOpening), f.cuff, text(m.cuff))}
    </table>
    <h2>${PDF.designTitle}</h2>
    <table>
      ${row(f.collarStyle, text(collar), f.hasChakPattiKaaj, yesNo(m.hasChakPattiKaaj))}
      ${row(f.hasChestPocket, yesNo(m.hasChestPocket), f.hasSidePockets, yesNo(m.hasSidePockets))}
      ${row(f.hasShalwarPocket, yesNo(m.hasShalwarPocket))}
    </table>
    ${m.notes ? `<h2>${PDF.notes}</h2><div class="notes">${text(m.notes)}</div>` : ''}
  </main>
  <footer>${companyName ? text(companyName) : ''}</footer>
</body></html>`;
}

/**
 * Creates the measurement PDF and opens the share sheet (save to Files,
 * WhatsApp, etc.). On web the browser print dialog opens instead, where the
 * user can choose "Save as PDF".
 */
export async function downloadMeasurementPdf(
  measurement: IMeasurement,
  companyName: string,
  dialogTitle?: string,
): Promise<void> {
  const html = buildMeasurementHtml(measurement, companyName);

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }

  // A4 at 72 PPI.
  const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 });
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle,
  });
}
