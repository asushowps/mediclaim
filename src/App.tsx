import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { UploadZone } from './components/UploadZone';
import { MedicalRecordsTable } from './components/MedicalRecordsTable';
import { RecordModal } from './components/RecordModal';
import { ManualRecordModal } from './components/ManualRecordModal';
import { WebcamModal } from './components/WebcamModal';
import { exportRecordsToExcel } from './utils/excelExport';
import { SAMPLE_RECEIPTS_DATA, generateSampleReceiptImage } from './utils/sampleReceipts';
import { MedicalRecord, ProcessingQueueItem } from './types';
import { CheckCircle2, AlertCircle, Info, X, ShieldCheck, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'mediclaim_records_v1';

export default function App() {
  const [records, setRecords] = useState<MedicalRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load records from localStorage', e);
    }
    // Initial starter demo records so user sees realistic data immediately
    return [
      {
        id: 'rec-init-1',
        employeeName: 'Sarah Chen Wei Ling',
        clinicName: 'Raffles Medical Group (Raffles Place)',
        subTotal: 90.0,
        gst: 8.1,
        grandTotal: 98.1,
        illnessSummary: 'Acute Upper Respiratory Tract Infection (URTI) with dry cough',
        receiptDate: '2026-09-14',
        receiptNumber: 'RMG-2026-89421',
        currency: 'SGD',
        confidence: 'HIGH',
        imageUrl: generateSampleReceiptImage('sample-raffles'),
        imageFilename: 'Raffles_Medical_Receipt.png',
        createdAt: '2026-09-14T09:30:00Z',
        status: 'verified',
        notes: 'Corporate Co-payment claim',
      },
      {
        id: 'rec-init-2',
        employeeName: 'David Tan Hock Leong',
        clinicName: 'Parkway Shenton Medical Clinic',
        subTotal: 104.0,
        gst: 9.36,
        grandTotal: 113.36,
        illnessSummary: 'Acute Gastroenteritis & Dehydration',
        receiptDate: '2026-09-22',
        receiptNumber: 'PSH-744091',
        currency: 'SGD',
        confidence: 'HIGH',
        imageUrl: generateSampleReceiptImage('sample-parkway'),
        imageFilename: 'Parkway_Shenton_Receipt.png',
        createdAt: '2026-09-22T14:15:00Z',
        status: 'verified',
        notes: 'Outpatient medical claim',
      },
    ];
  });

  const [queue, setQueue] = useState<ProcessingQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isWebcamModalOpen, setIsWebcamModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [records]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Process files through OCR endpoint
  const handleFilesSelected = async (files: { dataUrl: string; mimeType: string; filename: string }[]) => {
    if (files.length === 0) return;

    const newQueueItems: ProcessingQueueItem[] = files.map((file) => ({
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      filename: file.filename,
      fileSize: Math.round(file.dataUrl.length * 0.75),
      dataUrl: file.dataUrl,
      mimeType: file.mimeType,
      status: 'queued',
      progress: 0,
    }));

    setQueue((prev) => [...prev, ...newQueueItems]);
    setIsProcessing(true);

    // Process each queue item sequentially or in controlled parallel
    for (const item of newQueueItems) {
      // Mark as processing
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'processing', progress: 30 } : q))
      );

      try {
        const response = await fetch('/api/extract-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: item.dataUrl,
            mimeType: item.mimeType,
            filename: item.filename,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${response.status}`);
        }

        const resData = await response.json();
        if (!resData.success || !resData.data) {
          throw new Error(resData.error || 'Failed to extract receipt information.');
        }

        const extracted = resData.data;

        // Build new MedicalRecord
        const newRecord: MedicalRecord = {
          id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          employeeName: extracted.employeeName || 'Unknown Employee',
          clinicName: extracted.clinicName || 'Medical Clinic',
          subTotal: Number(extracted.subTotal) || 0,
          gst: Number(extracted.gst) || 0,
          grandTotal: Number(extracted.grandTotal) || 0,
          illnessSummary: extracted.illnessSummary || 'General Consultation',
          receiptDate: extracted.receiptDate || new Date().toISOString().split('T')[0],
          receiptNumber: extracted.receiptNumber || `INV-${Math.floor(100000 + Math.random() * 900000)}`,
          currency: extracted.currency || 'SGD',
          confidence: extracted.confidence || 'HIGH',
          lineItems: extracted.lineItems || [],
          imageUrl: item.dataUrl,
          imageFilename: item.filename,
          createdAt: new Date().toISOString(),
          status: 'verified',
        };

        // Add to records
        setRecords((prev) => [newRecord, ...prev]);

        // Update queue item
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'completed', progress: 100, record: newRecord }
              : q
          )
        );

        showToast(
          `Extracted: ${newRecord.employeeName} - ${newRecord.clinicName} ($${newRecord.grandTotal.toFixed(2)})`,
          'success'
        );
      } catch (err: any) {
        console.error('Extraction error for', item.filename, err);
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'error', progress: 0, error: err.message || 'Extraction failed' }
              : q
          )
        );
        showToast(`Failed to parse ${item.filename}: ${err.message}`, 'error');
      }
    }

    setIsProcessing(false);
  };

  const handleExportExcel = (customRecords?: MedicalRecord[]) => {
    try {
      const recordsToExport = customRecords && customRecords.length > 0 ? customRecords : records;
      if (recordsToExport.length === 0) {
        showToast('No records available to export.', 'error');
        return;
      }
      const filename = exportRecordsToExcel(recordsToExport);
      showToast(`Successfully downloaded "${filename}"`, 'success');
    } catch (err: any) {
      console.error('Export error:', err);
      showToast(err.message || 'Failed to export Excel file.', 'error');
    }
  };

  const handleOpenRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleSaveRecord = (updated: MedicalRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showToast(`Updated claim record for ${updated.employeeName}`, 'success');
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showToast('Record deleted.', 'info');
  };

  const handleDeleteMultiple = (ids: string[]) => {
    setRecords((prev) => prev.filter((r) => !ids.includes(r.id)));
    showToast(`Deleted ${ids.length} records.`, 'info');
  };

  const handleAddManualRecord = (record: MedicalRecord) => {
    setRecords((prev) => [record, ...prev]);
    showToast(`Added manual claim for ${record.employeeName}`, 'success');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all submission records?')) {
      setRecords([]);
      setQueue([]);
      showToast('All records cleared.', 'info');
    }
  };

  const handleLoadSamples = () => {
    const samples: MedicalRecord[] = SAMPLE_RECEIPTS_DATA.map((sample) => ({
      id: `rec-sample-${sample.id}`,
      employeeName: sample.employee,
      clinicName: sample.clinic,
      subTotal: sample.subTotal,
      gst: sample.gstAmount,
      grandTotal: sample.grandTotal,
      illnessSummary: sample.diagnosis,
      receiptDate: sample.date,
      receiptNumber: sample.invoiceNo,
      currency: 'SGD',
      confidence: 'HIGH',
      imageUrl: generateSampleReceiptImage(sample.id),
      imageFilename: `${sample.name.replace(/\s+/g, '_')}_Receipt.png`,
      createdAt: new Date().toISOString(),
      status: 'verified',
      notes: 'Sample verified clinic receipt',
    }));

    setRecords(samples);
    showToast(`Loaded ${samples.length} sample clinic receipts.`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-in max-w-md">
          <div
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700 shadow-rose-950/20'
                : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/20'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-teal-400 shrink-0" />}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        records={records}
        onExportExcel={() => handleExportExcel()}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        onClearAll={handleClearAll}
        onLoadSamples={handleLoadSamples}
        isProcessing={isProcessing}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Hero Banner */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wider">
                Automated Claims OCR
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>IRAS & Corporate Insurance Ready</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Medical Cost Submission Portal
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl mt-1">
              Upload or drag & drop medical bills and clinic receipts. Gemini Vision OCR instantly extracts
              the employee name, clinic name, sub-total, GST, grand total, and illness diagnosis. Download
              all verified claims into an Excel (.xlsx) file.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleLoadSamples}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Reset Sample Records</span>
            </button>
            {records.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors shadow-2xs"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Stats Summary Cards */}
        <StatsCards records={records} />

        {/* Upload & Drag & Drop Area */}
        <UploadZone
          onFilesSelected={handleFilesSelected}
          queue={queue}
          isProcessing={isProcessing}
          onOpenWebcam={() => setIsWebcamModalOpen(true)}
          onClearQueueItem={(id) => setQueue((prev) => prev.filter((q) => q.id !== id))}
        />

        {/* Medical Records Table */}
        <MedicalRecordsTable
          records={records}
          onSelectRecord={handleOpenRecord}
          onEditRecord={handleOpenRecord}
          onDeleteRecord={handleDeleteRecord}
          onDeleteMultiple={handleDeleteMultiple}
          onExportExcel={handleExportExcel}
          onOpenManualModal={() => setIsManualModalOpen(true)}
          onLoadSamples={handleLoadSamples}
        />
      </main>

      {/* Review / Edit Modal */}
      <RecordModal
        isOpen={isRecordModalOpen}
        record={selectedRecord}
        onClose={() => {
          setIsRecordModalOpen(false);
          setSelectedRecord(null);
        }}
        onSave={handleSaveRecord}
        onDelete={handleDeleteRecord}
      />

      {/* Manual Entry Modal */}
      <ManualRecordModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAddRecord={handleAddManualRecord}
      />

      {/* Webcam Photo Capture Modal */}
      <WebcamModal
        isOpen={isWebcamModalOpen}
        onClose={() => setIsWebcamModalOpen(false)}
        onCapture={(dataUrl, filename) => {
          handleFilesSelected([{ dataUrl, mimeType: 'image/jpeg', filename }]);
        }}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediClaim OCR • Intelligent Medical Cost Submission System</span>
          <span>Exports clean, formula-ready .xlsx spreadsheets for HR & Finance</span>
        </div>
      </footer>
    </div>
  );
}
