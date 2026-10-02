import React from 'react';
import { DollarSign, FileText, Building2, Percent, Calculator, Activity } from 'lucide-react';
import { MedicalRecord } from '../types';

interface StatsCardsProps {
  records: MedicalRecord[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ records }) => {
  if (records.length === 0) return null;

  const totalGrand = records.reduce((sum, r) => sum + (Number(r.grandTotal) || 0), 0);
  const totalSub = records.reduce((sum, r) => sum + (Number(r.subTotal) || 0), 0);
  const totalGst = records.reduce((sum, r) => sum + (Number(r.gst) || 0), 0);
  const avgClaim = records.length > 0 ? totalGrand / records.length : 0;
  const uniqueClinics = new Set(records.map((r) => r.clinicName.trim()).filter(Boolean)).size;
  const uniqueEmployees = new Set(records.map((r) => r.employeeName.trim()).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Grand Total */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Grand Amount
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
              ${totalGrand.toFixed(2)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              From {records.length} {records.length === 1 ? 'receipt' : 'receipts'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub-Total & GST */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sub-Total & GST
            </p>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
                ${totalSub.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-medium">subtotal</span>
            </div>
            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center space-x-1 font-mono">
              <span>+${totalGst.toFixed(2)} GST</span>
              <span className="text-slate-400 font-normal">({totalSub > 0 ? ((totalGst / totalSub) * 100).toFixed(1) : 0}%)</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Average Claim */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Per Visit
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-mono">
              ${avgClaim.toFixed(2)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Across {uniqueEmployees} {uniqueEmployees === 1 ? 'employee' : 'employees'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Calculator className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Clinics / Providers */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Healthcare Providers
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-mono">
              {uniqueClinics}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Distinct clinics or hospitals
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
