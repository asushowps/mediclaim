import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Eye,
  FileSpreadsheet,
  Plus,
  Receipt,
  Download,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { MedicalRecord, FilterState } from '../types';

interface MedicalRecordsTableProps {
  records: MedicalRecord[];
  onSelectRecord: (record: MedicalRecord) => void;
  onEditRecord: (record: MedicalRecord) => void;
  onDeleteRecord: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onExportExcel: (recordsToExport?: MedicalRecord[]) => void;
  onOpenManualModal: () => void;
  onLoadSamples: () => void;
}

export const MedicalRecordsTable: React.FC<MedicalRecordsTableProps> = ({
  records,
  onSelectRecord,
  onEditRecord,
  onDeleteRecord,
  onDeleteMultiple,
  onExportExcel,
  onOpenManualModal,
  onLoadSamples,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'date' | 'employee' | 'clinic' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [clinicFilter, setClinicFilter] = useState<string>('all');

  // Extract unique clinics for filter dropdown
  const uniqueClinics = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.clinicName) set.add(r.clinicName);
    });
    return Array.from(set).sort();
  }, [records]);

  // Filtered & sorted records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          rec.employeeName.toLowerCase().includes(query) ||
          rec.clinicName.toLowerCase().includes(query) ||
          rec.illnessSummary.toLowerCase().includes(query) ||
          rec.receiptNumber.toLowerCase().includes(query);

        const matchesClinic = clinicFilter === 'all' || rec.clinicName === clinicFilter;

        return matchesSearch && matchesClinic;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'date') {
          comparison = (a.receiptDate || '').localeCompare(b.receiptDate || '');
        } else if (sortField === 'employee') {
          comparison = a.employeeName.localeCompare(b.employeeName);
        } else if (sortField === 'clinic') {
          comparison = a.clinicName.localeCompare(b.clinicName);
        } else if (sortField === 'total') {
          comparison = (a.grandTotal || 0) - (b.grandTotal || 0);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [records, searchQuery, clinicFilter, sortField, sortOrder]);

  // Bulk selection handling
  const allFilteredSelected =
    filteredRecords.length > 0 && filteredRecords.every((r) => selectedIds.has(r.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<string>();
      filteredRecords.forEach((r) => next.add(r.id));
      setSelectedIds(next);
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSort = (field: 'date' | 'employee' | 'clinic' | 'total') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Totals for filtered records
  const totalSub = filteredRecords.reduce((sum, r) => sum + (Number(r.subTotal) || 0), 0);
  const totalGst = filteredRecords.reduce((sum, r) => sum + (Number(r.gst) || 0), 0);
  const totalGrand = filteredRecords.reduce((sum, r) => sum + (Number(r.grandTotal) || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Action Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>Medical Cost Claims Table</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200/80 text-slate-700">
              {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time extracted employee claims, clinic fees, GST, and illness diagnosis
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee, clinic, illness..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Clinic filter dropdown */}
          {uniqueClinics.length > 1 && (
            <select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              className="text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Clinics ({uniqueClinics.length})</option>
              {uniqueClinics.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center space-x-1.5 bg-teal-50 border border-teal-200 px-2 py-1 rounded-lg">
              <span className="text-xs font-semibold text-teal-800">
                {selectedIds.size} selected
              </span>
              <button
                onClick={() => {
                  const selectedRecords = records.filter((r) => selectedIds.has(r.id));
                  onExportExcel(selectedRecords);
                }}
                className="px-2 py-0.5 text-xs font-semibold text-teal-800 hover:text-teal-900 bg-white rounded border border-teal-300 shadow-2xs hover:bg-teal-50 transition-colors"
                title="Export only selected rows"
              >
                Export
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${selectedIds.size} selected records?`)) {
                    onDeleteMultiple(Array.from(selectedIds));
                    setSelectedIds(new Set());
                  }
                }}
                className="px-2 py-0.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-white rounded border border-rose-200 shadow-2xs hover:bg-rose-50 transition-colors"
                title="Delete selected rows"
              >
                Delete
              </button>
            </div>
          )}

          <button
            onClick={() => onExportExcel(filteredRecords)}
            disabled={filteredRecords.length === 0}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50"
            title="Download active records as Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
            <span>.xlsx</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      {filteredRecords.length === 0 ? (
        <div className="py-14 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No medical records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {records.length === 0
              ? 'Upload your first medical bill or clinic receipt above, or load sample receipts to explore.'
              : 'No records match your active search filters.'}
          </p>
          {records.length === 0 ? (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={onLoadSamples}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
              >
                <span>Load 4 Sample Receipts</span>
              </button>
              <button
                onClick={onOpenManualModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record Manually</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setClinicFilter('all');
              }}
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                {/* Select All Checkbox */}
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-slate-500 hover:text-slate-700 focus:outline-hidden"
                    title={allFilteredSelected ? 'Deselect all' : 'Select all'}
                  >
                    {allFilteredSelected ? (
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>

                {/* S/N & Receipt Image Preview */}
                <th className="py-3 px-2 w-12 text-center">Receipt</th>

                {/* 1. Name of Employee */}
                <th
                  onClick={() => handleSort('employee')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>1. Name of Employee</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 2. Clinic Name */}
                <th
                  onClick={() => handleSort('clinic')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>2. Clinic Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 3. Sub-Total */}
                <th className="py-3 px-3 text-right">
                  <span>3. Sub-Total</span>
                </th>

                {/* 4. GST */}
                <th className="py-3 px-3 text-right">
                  <span>4. GST</span>
                </th>

                {/* 5. Grand Total */}
                <th
                  onClick={() => handleSort('total')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/60 transition-colors"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>5. Grand Total</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 6. Summary of illness */}
                <th className="py-3 px-4 min-w-[220px]">
                  <span>6. Summary of Illness</span>
                </th>

                {/* Date & Actions */}
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="py-3 px-3 text-right w-20">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/80">
              {filteredRecords.map((record, index) => {
                const isSelected = selectedIds.has(record.id);

                return (
                  <tr
                    key={record.id}
                    onClick={() => onSelectRecord(record)}
                    className={`group transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/60 hover:bg-teal-50'
                        : index % 2 === 0
                        ? 'bg-white hover:bg-slate-50/80'
                        : 'bg-slate-50/30 hover:bg-slate-50'
                    }`}
                  >
                    {/* Row Checkbox */}
                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => handleToggleRow(record.id, e)}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-teal-600 inline-block" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400 inline-block" />
                      )}
                    </td>

                    {/* Receipt thumbnail */}
                    <td className="py-3 px-2 text-center">
                      {record.imageUrl ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRecord(record);
                          }}
                          className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 mx-auto shadow-2xs hover:scale-105 transition-transform bg-slate-100 flex items-center justify-center"
                          title="Click to view full receipt"
                        >
                          <img
                            src={record.imageUrl}
                            alt="Receipt"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-[10px] font-mono">
                          N/A
                        </div>
                      )}
                    </td>

                    {/* 1. Name of Employee */}
                    <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span>{record.employeeName}</span>
                        {record.status === 'manual' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Manual
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Clinic Name */}
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap font-medium">
                      <div className="flex items-center space-x-1.5">
                        <span className="truncate max-w-[200px]" title={record.clinicName}>
                          {record.clinicName}
                        </span>
                      </div>
                    </td>

                    {/* 3. Sub-Total */}
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ${Number(record.subTotal || 0).toFixed(2)}
                    </td>

                    {/* 4. GST */}
                    <td className="py-3 px-3 text-right font-mono text-emerald-700">
                      ${Number(record.gst || 0).toFixed(2)}
                    </td>

                    {/* 5. Grand Total */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50/50">
                      <span className="text-teal-700 font-extrabold">
                        ${Number(record.grandTotal || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* 6. Summary of Illness */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-teal-50/70 text-teal-900 border border-teal-100/80 max-w-xs truncate">
                        <span className="truncate" title={record.illnessSummary}>
                          {record.illnessSummary || 'General consultation'}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-500 text-xs font-mono whitespace-nowrap">
                      {record.receiptDate || '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditRecord(record);
                          }}
                          className="p-1.5 text-slate-400 hover:text-teal-600 rounded-md hover:bg-slate-100 transition-colors"
                          title="Edit record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete record for ${record.employeeName}?`)) {
                              onDeleteRecord(record.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer with Totals */}
            <tfoot>
              <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-slate-900 text-xs sm:text-sm">
                <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-slate-600">
                  Total Summary ({filteredRecords.length} items):
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-700">
                  ${totalSub.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-700">
                  ${totalGst.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-teal-800 font-extrabold bg-teal-50 border-x border-teal-200">
                  ${totalGrand.toFixed(2)}
                </td>
                <td colSpan={3} className="py-3 px-4 text-xs text-slate-500 font-normal">
                  Grand Total equals Sub-Total + GST. Ready for Excel export.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
