import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileImage,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  X,
  ArrowRight,
} from 'lucide-react';
import { SAMPLE_RECEIPTS_DATA, generateSampleReceiptImage } from '../utils/sampleReceipts';
import { ProcessingQueueItem } from '../types';

interface UploadZoneProps {
  onFilesSelected: (files: { dataUrl: string; mimeType: string; filename: string }[]) => void;
  queue: ProcessingQueueItem[];
  isProcessing: boolean;
  onOpenWebcam: () => void;
  onClearQueueItem?: (id: string) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  queue,
  isProcessing,
  onOpenWebcam,
  onClearQueueItem,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Global paste handler (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const filesToProcess: { dataUrl: string; mimeType: string; filename: string }[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
              if (uploadEvent.target?.result) {
                filesToProcess.push({
                  dataUrl: uploadEvent.target.result as string,
                  mimeType: file.type,
                  filename: file.name || `Pasted_Receipt_${Date.now()}.png`,
                });
                if (filesToProcess.length === 1) {
                  onFilesSelected(filesToProcess);
                }
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const processFileList = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const results: { dataUrl: string; mimeType: string; filename: string }[] = [];
    let processedCount = 0;

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          results.push({
            dataUrl: e.target.result as string,
            mimeType: file.type,
            filename: file.name,
          });
        }
        processedCount++;
        if (processedCount === fileArray.length) {
          onFilesSelected(results);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    processFileList(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFileList(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_RECEIPTS_DATA.find((s) => s.id === sampleId);
    if (!sample) return;

    const dataUrl = generateSampleReceiptImage(sampleId);
    onFilesSelected([
      {
        dataUrl,
        mimeType: 'image/png',
        filename: `${sample.name.replace(/\s+/g, '_')}_Receipt.png`,
      },
    ]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-8">
      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer p-8 sm:p-10 text-center flex flex-col items-center justify-center ${
          isDragOver
            ? 'border-teal-500 bg-teal-50/70 scale-[0.99]'
            : 'border-slate-300 hover:border-teal-500/80 bg-slate-50/60 hover:bg-teal-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="w-16 h-16 rounded-2xl bg-teal-100/80 text-teal-700 flex items-center justify-center mb-4 shadow-xs">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-800">
          Upload Medical Bills & Clinic Receipts
        </h3>
        <p className="text-sm text-slate-500 max-w-md mt-1">
          Drag and drop images here, or <span className="text-teal-600 font-semibold underline">browse from device</span>.
          Multiple receipts supported. You can also paste directly (Ctrl+V).
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center text-xs font-medium text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            JPG, PNG, WEBP
          </span>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenWebcam();
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Take Photo with Camera</span>
          </button>
        </div>
      </div>

      {/* Quick Test Samples Selector */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              No receipt handy? Try instant clinic test receipts:
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click any receipt to run AI OCR extraction
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_RECEIPTS_DATA.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample.id)}
              disabled={isProcessing}
              className="text-left p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all group disabled:opacity-50 cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                  {sample.name}
                </span>
                <span className="text-xs font-bold text-teal-700 font-mono">
                  ${sample.grandTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mb-1">
                {sample.employee}
              </p>
              <p className="text-[11px] font-medium text-emerald-700 truncate bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                {sample.diagnosis}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Processing Batch Queue display */}
      {queue.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <span>Extraction Queue</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                {queue.filter((q) => q.status === 'completed').length} / {queue.length} processed
              </span>
            </h4>
            {isProcessing && (
              <div className="flex items-center space-x-2 text-xs font-semibold text-teal-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting information with Gemini OCR...</span>
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/80 text-xs"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <img
                    src={item.dataUrl}
                    alt={item.filename}
                    className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0 bg-white"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 truncate">{item.filename}</p>
                    <div className="flex items-center space-x-2 text-[11px]">
                      {item.status === 'processing' && (
                        <span className="text-teal-600 flex items-center space-x-1 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Reading OCR & parsing amounts...</span>
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <span className="text-emerald-600 flex items-center space-x-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            Extracted: {item.record?.employeeName} • ${item.record?.grandTotal?.toFixed(2)}
                          </span>
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="text-rose-600 flex items-center space-x-1 font-medium">
                          <AlertCircle className="w-3 h-3" />
                          <span>{item.error || 'Failed to extract'}</span>
                        </span>
                      )}
                      {item.status === 'queued' && (
                        <span className="text-slate-400">In queue...</span>
                      )}
                    </div>
                  </div>
                </div>

                {onClearQueueItem && item.status !== 'processing' && (
                  <button
                    onClick={() => onClearQueueItem(item.id)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
