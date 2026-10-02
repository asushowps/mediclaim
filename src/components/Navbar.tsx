import React from 'react';
import { FileSpreadsheet, Plus, Receipt, Sparkles, Trash2, RotateCcw } from 'lucide-react';
import { MedicalRecord } from '../types';

interface NavbarProps {
  records: MedicalRecord[];
  onExportExcel: () => void;
  onOpenManualModal: () => void;
  onClearAll: () => void;
  onLoadSamples: () => void;
  isProcessing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  records,
  onExportExcel,
  onOpenManualModal,
  onClearAll,
  onLoadSamples,
  isProcessing,
}) => {
  const totalGrand = records.reduce((sum, r) => sum + (Number(r.grandTotal) || 0), 0);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-600/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">MediClaim</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                  OCR Vision
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Medical Cost Submission & Expense Extraction Portal
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {records.length > 0 && (
              <div className="hidden md:flex flex-col text-right mr-1">
                <span className="text-xs text-slate-400 font-medium">Claims Total</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  ${totalGrand.toFixed(2)}
                </span>
              </div>
            )}

            <button
              onClick={onOpenManualModal}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 shadow-xs"
              title="Add a medical claim record manually"
            >
              <Plus className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Add Record</span>
            </button>

            <button
              onClick={onExportExcel}
              disabled={records.length === 0}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                records.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:shadow-md cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
              title={records.length > 0 ? 'Download all records as Excel (.xlsx)' : 'Add records to enable Excel download'}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
              {records.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded text-[11px] font-bold bg-emerald-800/40 text-emerald-100">
                  {records.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
