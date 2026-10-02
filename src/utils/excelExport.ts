import * as XLSX from 'xlsx';
import { MedicalRecord } from '../types';

export function exportRecordsToExcel(records: MedicalRecord[], reportTitle: string = 'Medical Claims Submission') {
  if (!records || records.length === 0) {
    throw new Error('No records to export.');
  }

  // Calculate totals
  const totalSub = records.reduce((acc, r) => acc + (Number(r.subTotal) || 0), 0);
  const totalGst = records.reduce((acc, r) => acc + (Number(r.gst) || 0), 0);
  const totalGrand = records.reduce((acc, r) => acc + (Number(r.grandTotal) || 0), 0);

  // Build rows array for SheetJS
  const rows: any[][] = [];

  // Title & Metadata Header
  rows.push(['MEDICAL COST & EXPENSE CLAIMS REPORT']);
  rows.push([`Generated On: ${new Date().toLocaleString()}`, '', `Total Records: ${records.length}`, '', `Total Claimed: $${totalGrand.toFixed(2)}`]);
  rows.push([]); // blank row

  // Table Column Headers (Directly matching required fields)
  rows.push([
    'S/N',
    'Name of Employee',
    'Clinic Name',
    'Sub-Total ($)',
    'GST ($)',
    'Grand Total ($)',
    'Summary of Illness',
    'Visit Date',
    'Receipt / Invoice #',
    'Currency',
    'Status',
    'Notes',
  ]);

  // Data rows
  records.forEach((rec, idx) => {
    rows.push([
      idx + 1,
      rec.employeeName || 'Unknown Employee',
      rec.clinicName || 'Unknown Clinic',
      Number(rec.subTotal?.toFixed(2)) || 0,
      Number(rec.gst?.toFixed(2)) || 0,
      Number(rec.grandTotal?.toFixed(2)) || 0,
      rec.illnessSummary || 'General Consultation',
      rec.receiptDate || '',
      rec.receiptNumber || '',
      rec.currency || 'SGD',
      rec.status === 'verified' ? 'Verified' : rec.status === 'manual' ? 'Manual Entry' : 'Pending Review',
      rec.notes || '',
    ]);
  });

  // Empty separator
  rows.push([]);

  // Summary Row
  rows.push([
    'TOTALS',
    '',
    '',
    Number(totalSub.toFixed(2)),
    Number(totalGst.toFixed(2)),
    Number(totalGrand.toFixed(2)),
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  // Create worksheet from AoA (Array of Arrays)
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Auto-fit column widths
  const colWidths = [
    { wch: 6 },  // S/N
    { wch: 26 }, // Employee Name
    { wch: 32 }, // Clinic Name
    { wch: 14 }, // Sub-Total
    { wch: 12 }, // GST
    { wch: 16 }, // Grand Total
    { wch: 42 }, // Summary of Illness
    { wch: 14 }, // Date
    { wch: 20 }, // Receipt #
    { wch: 10 }, // Currency
    { wch: 16 }, // Status
    { wch: 25 }, // Notes
  ];
  worksheet['!cols'] = colWidths;

  // Format currency cells if possible
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Medical Submissions');

  // Generate file name with current date
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `Medical_Claims_Submission_${dateStr}.xlsx`;

  // Write and trigger download
  XLSX.writeFile(workbook, filename);

  return filename;
}
