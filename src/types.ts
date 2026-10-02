export interface LineItem {
  description: string;
  amount: number;
}

export interface MedicalRecord {
  id: string;
  employeeName: string;
  clinicName: string;
  subTotal: number;
  gst: number;
  grandTotal: number;
  illnessSummary: string;
  receiptDate: string;
  receiptNumber: string;
  currency: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  lineItems?: LineItem[];
  imageUrl?: string;
  imageFilename?: string;
  createdAt: string;
  status: 'verified' | 'pending_review' | 'manual';
  notes?: string;
}

export interface ProcessingQueueItem {
  id: string;
  filename: string;
  fileSize: number;
  dataUrl: string;
  mimeType: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  record?: MedicalRecord;
}

export interface FilterState {
  searchQuery: string;
  employeeFilter: string;
  clinicFilter: string;
  startDate: string;
  endDate: string;
  sortBy: 'date' | 'employee' | 'clinic' | 'total';
  sortOrder: 'asc' | 'desc';
}
