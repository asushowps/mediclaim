// Generator for realistic clinic receipt images using Canvas
export interface SampleReceiptMeta {
  id: string;
  name: string;
  clinic: string;
  employee: string;
  diagnosis: string;
  grandTotal: string;
}

export const SAMPLE_RECEIPTS_DATA = [
  {
    id: 'sample-raffles',
    name: 'Raffles Medical',
    clinic: 'Raffles Medical Group (Raffles Place)',
    clinicAddress: '50 Raffles Place, #01-02 Singapore Land Tower, Singapore 048623',
    clinicReg: 'GST Reg No: M2-0019284-X | Clinic Lic: 9811200',
    employee: 'Sarah Chen Wei Ling',
    empId: 'EMP-4089',
    doctor: 'Dr. Michael Wong (MCR: 09234B)',
    date: '2026-09-14',
    invoiceNo: 'RMG-2026-89421',
    diagnosis: 'Acute Upper Respiratory Tract Infection (URTI) with dry cough',
    items: [
      { desc: 'Outpatient Medical Consultation (Standard GP)', cost: 45.00 },
      { desc: 'Tab Paracetamol 500mg (20s)', cost: 12.00 },
      { desc: 'Syr Promethazine Cough Linctus 100ml', cost: 18.00 },
      { desc: 'Tab Cetirizine 10mg (10s)', cost: 15.00 },
    ],
    subTotal: 90.00,
    gstRate: 0.09,
    gstAmount: 8.10,
    grandTotal: 98.10,
    paymentMethod: 'Corporate Insurance Co-payment / Credit Card (VISA *4829)',
  },
  {
    id: 'sample-parkway',
    name: 'Parkway Shenton',
    clinic: 'Parkway Shenton Medical Clinic',
    clinicAddress: '16 Collyer Quay, #03-01 Hitachi Tower, Singapore 049318',
    clinicReg: 'GST Reg No: 19-7400032-K | MOH Reg: PSM-7741',
    employee: 'David Tan Hock Leong',
    empId: 'EMP-1102',
    doctor: 'Dr. Audrey Lim (MCR: 11452D)',
    date: '2026-09-22',
    invoiceNo: 'PSH-744091',
    diagnosis: 'Acute Gastroenteritis & Dehydration',
    items: [
      { desc: 'Extended Consultation & Clinical Assessment', cost: 55.00 },
      { desc: 'Oral Rehydration Salts (Hydralyte 10pk)', cost: 16.50 },
      { desc: 'Cap Loperamide 2mg (10s)', cost: 14.00 },
      { desc: 'Tab Buscopan (Hyoscine-N-butylbromide 10mg)', cost: 18.50 },
    ],
    subTotal: 104.00,
    gstRate: 0.09,
    gstAmount: 9.36,
    grandTotal: 113.36,
    paymentMethod: 'NETS / Contactless Paid in Full',
  },
  {
    id: 'sample-minmed',
    name: 'Minmed Clinic',
    clinic: 'Minmed Clinic (Jurong Point)',
    clinicAddress: '1 Jurong West Central 2, #B1A-19A, Singapore 648886',
    clinicReg: 'GST Reg: 20-0309918-D | Tel: 6515 9938',
    employee: 'Priya Ramanathan',
    empId: 'EMP-3294',
    doctor: 'Dr. Eugene Tan (MCR: 14209H)',
    date: '2026-09-28',
    invoiceNo: 'MMC-INV-99381',
    diagnosis: 'Allergic Contact Dermatitis & Eczema Flare-up',
    items: [
      { desc: 'GP Consultation & Skin Evaluation', cost: 40.00 },
      { desc: 'Cream Hydrocortisone 1% 15g', cost: 19.50 },
      { desc: 'Cetaphil Restoraderm Moisturizing Wash 295ml', cost: 26.00 },
      { desc: 'Tab Fexofenadine (Telfast) 180mg (10s)', cost: 22.50 },
    ],
    subTotal: 108.00,
    gstRate: 0.09,
    gstAmount: 9.72,
    grandTotal: 117.72,
    paymentMethod: 'Apple Pay (MasterCard *9120)',
  },
  {
    id: 'sample-healthway',
    name: 'Healthway Medical',
    clinic: 'Healthway Medical Clinic (Tampines Hub)',
    clinicAddress: '1 Tampines Walk, #02-81 Our Tampines Hub, Singapore 528523',
    clinicReg: 'GST Reg No: 200708625Z | MOH Reg: HMC-284',
    employee: 'Marcus Wong Kah Fai',
    empId: 'EMP-5918',
    doctor: 'Dr. Fiona Chia (MCR: 08471K)',
    date: '2026-10-01',
    invoiceNo: 'HMC-662910',
    diagnosis: 'Tension Headache and Cervical Neck Muscle Spasm',
    items: [
      { desc: 'General Consultation & Posture Assessment', cost: 42.00 },
      { desc: 'Tab Naproxen Sodium 550mg (14s)', cost: 16.00 },
      { desc: 'Tab Myonal (Eperisone HCl 50mg) (20s)', cost: 18.00 },
    ],
    subTotal: 76.00,
    gstRate: 0.09,
    gstAmount: 6.84,
    grandTotal: 82.84,
    paymentMethod: 'Direct Claim / PayNow QR Paid',
  },
];

/**
 * Renders a crisp receipt on an offscreen canvas and returns a PNG Data URL
 */
export function generateSampleReceiptImage(sampleId: string): string {
  const data = SAMPLE_RECEIPTS_DATA.find((s) => s.id === sampleId) || SAMPLE_RECEIPTS_DATA[0];

  const width = 640;
  const height = 920;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - realistic thermal paper texture / slight off-white
  ctx.fillStyle = '#fbfcf8';
  ctx.fillRect(0, 0, width, height);

  // Subtle paper grain border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Perforated top receipt cut line
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(20, 24);
  ctx.lineTo(width - 20, 24);
  ctx.stroke();
  ctx.setLineDash([]);

  let y = 60;

  // Clinic Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(data.clinic, width / 2, y);

  y += 24;
  ctx.fillStyle = '#475569';
  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(data.clinicAddress, width / 2, y);

  y += 18;
  ctx.fillStyle = '#64748b';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText(data.clinicReg, width / 2, y);

  y += 24;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('*** OFFICIAL TAX INVOICE & MEDICAL RECEIPT ***', width / 2, y);

  // Divider line
  y += 18;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(35, y);
  ctx.lineTo(width - 35, y);
  ctx.stroke();

  // Patient / Employee info block
  y += 28;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1e293b';
  ctx.font = '13px "Plus Jakarta Sans", sans-serif';

  const leftX = 40;
  const rightColX = 360;

  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Patient / Employee Name:', leftX, y);
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0369a1';
  ctx.fillText(data.employee, leftX + 180, y);

  ctx.fillStyle = '#1e293b';
  ctx.font = '13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Date:', rightColX, y);
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText(data.date, rightColX + 50, y);

  y += 24;
  ctx.font = '13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Employee ID / NRIC:', leftX, y);
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText(data.empId, leftX + 180, y);

  ctx.font = '13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Invoice #:', rightColX, y);
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText(data.invoiceNo, rightColX + 70, y);

  y += 24;
  ctx.font = '13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Attending Doctor:', leftX, y);
  ctx.font = '13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(data.doctor, leftX + 180, y);

  // Diagnosis / Summary of illness box
  y += 32;
  ctx.fillStyle = '#f0fdf4';
  ctx.fillRect(35, y - 18, width - 70, 48);
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 1;
  ctx.strokeRect(35, y - 18, width - 70, 48);

  ctx.fillStyle = '#166534';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('DIAGNOSIS / SUMMARY OF ILLNESS:', leftX, y);
  y += 18;
  ctx.fillStyle = '#14532d';
  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(data.diagnosis, leftX, y);

  // Itemized breakdown table header
  y += 40;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(35, y - 16, width - 70, 26);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('DESCRIPTION / CHARGES', leftX, y);
  ctx.textAlign = 'right';
  ctx.fillText('AMOUNT (SGD)', width - 45, y);

  // Items
  y += 14;
  data.items.forEach((item) => {
    y += 26;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(item.desc, leftX, y);

    ctx.textAlign = 'right';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText(`$${item.cost.toFixed(2)}`, width - 45, y);
  });

  // Table bottom border
  y += 24;
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(35, y);
  ctx.lineTo(width - 35, y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Subtotal, GST, Grand Total rows
  y += 28;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#475569';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Sub-Total:', width - 180, y);
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(`$${data.subTotal.toFixed(2)}`, width - 45, y);

  y += 26;
  ctx.fillStyle = '#475569';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('GST (9.00%):', width - 180, y);
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(`$${data.gstAmount.toFixed(2)}`, width - 45, y);

  // Grand Total highlight box
  y += 34;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(width - 320, y - 22, 285, 42);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('GRAND TOTAL:', width - 160, y + 4);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillText(`$${data.grandTotal.toFixed(2)}`, width - 45, y + 5);

  // Payment note and footer
  y += 56;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Payment Mode: ${data.paymentMethod}`, leftX, y);

  y += 20;
  ctx.font = '11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Status: PAID IN FULL - ELIGIBLE FOR CORPORATE INSURANCE SUBMISSION', leftX, y);

  y += 30;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText('Thank you for choosing us. Wishing you a swift recovery!', width / 2, y);

  y += 18;
  ctx.fillText('Computer-generated receipt. No signature required.', width / 2, y);

  // Return PNG data URL
  return canvas.toDataURL('image/png');
}
