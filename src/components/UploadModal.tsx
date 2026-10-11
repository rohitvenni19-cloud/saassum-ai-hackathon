import React, { useState } from 'react';
import { CustomerRecord, DatasetMeta } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (records: CustomerRecord[], meta: DatasetMeta) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDatasetLoaded,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Please upload a .csv or .txt file format.');
      return;
    }
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        setError('CSV must contain a header row and at least one data row.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const parsedRecords: CustomerRecord[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        const padId = String(i).padStart(3, '0');

        parsedRecords.push({
          id: padId,
          customer_id: parts[0] || `CUST-${1000 + i}`,
          full_name: parts[1] || `User ${i}`,
          email: parts[2] || `user${i}@example.com`,
          phone_number: parts[3] || '',
          signup_date: parts[4] || '2023-01-01',
          city: parts[5] || 'Unknown',
          account_tier: (parts[6] as any) || 'Free',
          annual_revenue: parts[7] ? parseFloat(parts[7]) || 0 : null,
          has_whitespace_name: parts[1]?.startsWith(' ') || parts[1]?.endsWith(' '),
          has_uppercase_email: parts[2] ? /[A-Z]/.test(parts[2]) : false,
          has_unnormalized_phone: parts[3] ? !parts[3].startsWith('+') : false,
          has_missing_revenue: !parts[7],
        });
      }

      const newMeta: DatasetMeta = {
        filename: file.name,
        rowCount: parsedRecords.length,
        columnCount: headers.length,
        sizeKb: `${(file.size / 1024).toFixed(1)} KB`,
        checksum: `sha256:${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
        bufferStatus: 'Live Buffer Ingested',
      };

      onDatasetLoaded(parsedRecords, newMeta);
      onClose();
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#cbd5e1] max-w-lg w-full p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] text-[24px]">upload_file</span>
            <h3 className="font-bold text-base text-[#0b1c30]">Ingest New Dataset (.csv, .xlsx)</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="bg-[#ffdad6] text-[#ba1a1a] p-2.5 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        <div
          onDragOver={e => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={e => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
            dragActive ? 'border-[#004ac6] bg-[#eff4ff]' : 'border-[#cbd5e1] hover:border-[#004ac6] bg-[#f8fafc]'
          }`}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <div className="w-12 h-12 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
            <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
          </div>
          <span className="text-sm font-semibold text-[#0b1c30]">
            Drag and drop your spreadsheet here
          </span>
          <span className="text-xs text-[#64748b]">Supports CSV (UTF-8), Excel exports (.csv)</span>
          <input
            id="file-input"
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        </div>

        {fileName && (
          <div className="text-xs font-mono text-[#004ac6] bg-[#eff4ff] p-2 rounded">
            Selected: {fileName}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:text-[#0b1c30]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
