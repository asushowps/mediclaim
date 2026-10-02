import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Receipt,
  Calculator,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { MedicalRecord } from '../types';

interface RecordModalProps {
  isOpen: boolean;
  record: MedicalRecord | null;
  onClose: () => void;
  onSave: (updatedRecord: MedicalRecord) => void;
  onDelete: (id: string) => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  record,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !record) return null;

  const [formData, setFormData] = useState<MedicalRecord>({ ...record });
  const [zoom, setZoom] = useState(1);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData({ ...record });
    setZoom(1);
    setHasChanges(false);
  }, [record]);

  const handleChange = (field: keyof MedicalRecord, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleRecalculateTotals = () => {
    const sub = parseFloat(formData.subTotal as any) || 0;
    const gst = parseFloat(formData.gst as any) || 0;
    const grand = +(sub + gst).toFixed(2);
    setFormData((prev) => ({
      ...prev,
      grandTotal: grand,
    }));
    setHasChanges(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      subTotal: parseFloat(formData.subTotal as any) || 0,
      gst: parseFloat(formData.gst as any) || 0,
      grandTotal: parseFloat(formData.grandTotal as any) || 0,
    });
    setHasChanges(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Medical Claim Record Review & Audit
              </h3>
              <p className="text-xs text-slate-500">
                Verify AI OCR extraction against the original medical receipt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Side-by-side Receipt image and Form */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
          {/* Left: Receipt Image Preview */}
          <div className="md:col-span-6 bg-slate-900 relative flex flex-col border-b md:border-b-0 md:border-r border-slate-200 min-h-[300px]">
            {/* Zoom toolbar */}
            <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5 bg-slate-800/90 backdrop-blur-xs p-1 rounded-lg border border-slate-700 text-white text-xs">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-1 hover:bg-slate-700 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] px-1">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="p-1 hover:bg-slate-700 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="p-1 hover:bg-slate-700 rounded"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Image viewport */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              {formData.imageUrl ? (
                <div
                  className="transition-transform duration-150 origin-center"
                  style={{ transform: `scale(${zoom})` }}
                >
                  <img
                    src={formData.imageUrl}
                    alt="Receipt"
                    className="max-h-[70vh] rounded shadow-lg object-contain bg-white"
                  />
                </div>
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No receipt image attached</p>
                  <span className="text-xs text-slate-500">Record was manually entered</span>
                </div>
              )}
            </div>

            {formData.imageFilename && (
              <div className="bg-slate-950/80 px-4 py-2 text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800">
                <span className="truncate">{formData.imageFilename}</span>
                {formData.imageUrl && (
                  <a
                    href={formData.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-400 hover:underline flex items-center space-x-1 shrink-0 ml-2"
                  >
                    <span>Full View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: Editable Extraction Form */}
          <div className="md:col-span-6 p-6 overflow-y-auto bg-white flex flex-col justify-between">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Extracted Fields
                </span>
                <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  <CheckCircle className="w-3 h-3" />
                  <span>OCR Verified</span>
                </span>
              </div>

              {/* 1. Name of Employee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  1. Name of Employee <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.employeeName}
                  onChange={(e) => handleChange('employeeName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g. Sarah Chen Wei Ling"
                />
              </div>

              {/* 2. Clinic Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  2. Clinic Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.clinicName}
                  onChange={(e) => handleChange('clinicName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g. Raffles Medical Group"
                />
              </div>

              {/* Financial Amounts (Sub-Total, GST, Grand Total) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Financial Cost Breakdown
                  </span>
                  <button
                    type="button"
                    onClick={handleRecalculateTotals}
                    className="inline-flex items-center space-x-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-100/60 hover:bg-teal-100 px-2 py-0.5 rounded transition-colors"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Subtotal + GST = Grand</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* 3. Sub-Total */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      3. Sub-Total ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.subTotal}
                      onChange={(e) => handleChange('subTotal', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* 4. GST */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      4. GST ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.gst}
                      onChange={(e) => handleChange('gst', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-emerald-700 font-semibold"
                    />
                  </div>

                  {/* 5. Grand Total */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-900 mb-1">
                      5. Grand Total ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.grandTotal}
                      onChange={(e) => handleChange('grandTotal', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-sm font-mono font-bold border border-teal-400 bg-teal-50/50 rounded-lg focus:ring-2 focus:ring-teal-500 text-teal-900"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Summary of illness */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  6. Summary of Illness <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.illnessSummary}
                  onChange={(e) => handleChange('illnessSummary', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g. Acute Upper Respiratory Tract Infection (URTI) with dry cough"
                />
              </div>

              {/* Secondary fields: Date & Ref # */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Date of Visit
                  </label>
                  <input
                    type="date"
                    value={formData.receiptDate}
                    onChange={(e) => handleChange('receiptDate', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Receipt / Invoice Ref #
                  </label>
                  <input
                    type="text"
                    value={formData.receiptNumber}
                    onChange={(e) => handleChange('receiptNumber', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="REC-XXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Claim Notes / Justification
                </label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Optional claim notes"
                />
              </div>

              {/* Bottom Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Delete this record?')) {
                      onDelete(formData.id);
                      onClose();
                    }
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
