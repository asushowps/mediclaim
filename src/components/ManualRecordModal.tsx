import React, { useState } from 'react';
import { X, Plus, Calculator, FileSpreadsheet, Building2, User, Stethoscope } from 'lucide-react';
import { MedicalRecord } from '../types';

interface ManualRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (record: MedicalRecord) => void;
}

export const ManualRecordModal: React.FC<ManualRecordModalProps> = ({
  isOpen,
  onClose,
  onAddRecord,
}) => {
  if (!isOpen) return null;

  const [employeeName, setEmployeeName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [subTotal, setSubTotal] = useState<string>('50.00');
  const [gst, setGst] = useState<string>('4.50');
  const [grandTotal, setGrandTotal] = useState<string>('54.50');
  const [illnessSummary, setIllnessSummary] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptNumber, setReceiptNumber] = useState(`MAN-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState('');

  const handleSubTotalChange = (val: string) => {
    setSubTotal(val);
    const sub = parseFloat(val) || 0;
    const gstVal = parseFloat((sub * 0.09).toFixed(2));
    setGst(gstVal.toString());
    setGrandTotal((sub + gstVal).toFixed(2));
  };

  const handleRecalculate = () => {
    const sub = parseFloat(subTotal) || 0;
    const gstVal = parseFloat(gst) || 0;
    setGrandTotal((sub + gstVal).toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName.trim() || !clinicName.trim() || !illnessSummary.trim()) {
      alert('Please fill in Employee Name, Clinic Name, and Summary of Illness.');
      return;
    }

    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      employeeName: employeeName.trim(),
      clinicName: clinicName.trim(),
      subTotal: parseFloat(subTotal) || 0,
      gst: parseFloat(gst) || 0,
      grandTotal: parseFloat(grandTotal) || 0,
      illnessSummary: illnessSummary.trim(),
      receiptDate,
      receiptNumber: receiptNumber.trim(),
      currency: 'SGD',
      status: 'manual',
      createdAt: new Date().toISOString(),
      notes: notes.trim(),
    };

    onAddRecord(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Medical Claim Manually</h3>
              <p className="text-xs text-slate-500">Record a claim without scanning a receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 1. Name of Employee */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              1. Name of Employee <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="e.g. Rachel Lim Min"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* 2. Clinic Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              2. Clinic Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="e.g. Shenton Medical Group"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* 3, 4, 5. Financial Breakdown */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Cost & Tax Breakdown (SGD)
              </span>
              <button
                type="button"
                onClick={handleRecalculate}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded flex items-center space-x-1"
              >
                <Calculator className="w-3 h-3" />
                <span>Calculate Total</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  3. Sub-Total ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={subTotal}
                  onChange={(e) => handleSubTotalChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  4. GST ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={gst}
                  onChange={(e) => {
                    setGst(e.target.value);
                    const s = parseFloat(subTotal) || 0;
                    const g = parseFloat(e.target.value) || 0;
                    setGrandTotal((s + g).toFixed(2));
                  }}
                  className="w-full px-2.5 py-1.5 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-emerald-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-900 mb-1">
                  5. Grand Total ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={grandTotal}
                  onChange={(e) => setGrandTotal(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm font-mono font-bold border border-teal-400 bg-teal-50 rounded-lg text-teal-900"
                />
              </div>
            </div>
          </div>

          {/* 6. Summary of illness */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              6. Summary of Illness <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <textarea
                rows={2}
                required
                value={illnessSummary}
                onChange={(e) => setIllnessSummary(e.target.value)}
                placeholder="e.g. Acute Gastric Flu & Viral Fever"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Secondary Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date of Visit</label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Receipt / Invoice Ref #</label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="REC-XXXXXX"
                className="w-full px-3 py-1.5 text-xs sm:text-sm font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
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
              <Plus className="w-4 h-4" />
              <span>Add to Table</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
