import React, { useState } from 'react';
import { exportUserDataJSON, downloadJSONFile, importUserDataJSON } from '../utils/exportImport';
import { X, Download, Upload, CheckCircle, AlertCircle, FileJson } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const json = await exportUserDataJSON();
      downloadJSONFile(json, `bookmarks-backup-${new Date().toISOString().slice(0, 10)}.json`);
      setStatusMessage({ type: 'success', text: 'Backup downloaded successfully!' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setStatusMessage({ type: 'error', text: `Export failed: ${message}` });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const result = await importUserDataJSON(content);
        setStatusMessage({
          type: 'success',
          text: `Import successful! Imported ${result.bookmarksImported} bookmarks and ${result.categoriesImported} new subjects.`,
        });
        onDataImported();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid backup file';
        setStatusMessage({ type: 'error', text: `Import failed: ${message}` });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <FileJson className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Backup & Restore</h2>
              <p className="text-xs text-slate-400">Export or import JSON data files</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Export Option */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white mb-0.5">Export Backup (JSON)</h3>
              <p className="text-[11px] text-slate-400">Save all subjects and bookmarks locally</p>
            </div>
            <button
              onClick={handleExport}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-600/30 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* Import Option */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white mb-0.5">Import Backup (JSON)</h3>
              <p className="text-[11px] text-slate-400">Restore bookmarks from JSON file</p>
            </div>
            <label className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{isImporting ? 'Importing...' : 'Select File'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
