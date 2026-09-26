import React, { useState } from 'react';
import { exportUserDataJSON, downloadJSONFile, importUserData, clearAllData } from '../utils/exportImport';
import { X, Download, Upload, CheckCircle, AlertCircle, FileCode, Trash2, RefreshCw } from 'lucide-react';

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
  const [clearBeforeImport, setClearBeforeImport] = useState(false);

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
        const result = await importUserData(content, file.name, clearBeforeImport);
        setStatusMessage({
          type: 'success',
          text: `Import successful! Added ${result.bookmarksImported} bookmarks and ${result.categoriesImported} categories.`,
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

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear ALL subjects and bookmarks?\nThis action cannot be undone.')) {
      try {
        await clearAllData();
        setStatusMessage({ type: 'success', text: 'All data has been cleared successfully.' });
        onDataImported();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setStatusMessage({ type: 'error', text: `Failed to clear data: ${message}` });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <FileCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Backup & Data Tools</h2>
              <p className="text-xs text-slate-400">Import, export, or reset your bookmark data</p>
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
              <p className="text-[11px] text-slate-400">Save all categories and bookmarks</p>
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
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white mb-0.5">Import Bookmarks</h3>
                <p className="text-[11px] text-slate-400">Supports JSON backup or HTML browser exports</p>
              </div>
              <label className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{isImporting ? 'Importing...' : 'Select File'}</span>
                <input
                  type="file"
                  accept=".json, .html, .htm"
                  onChange={handleFileUpload}
                  disabled={isImporting}
                  className="hidden"
                />
              </label>
            </div>

            {/* Checkbox: Clear before import */}
            <label className="flex items-center gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={clearBeforeImport}
                onChange={(e) => setClearBeforeImport(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
              <span className="flex items-center gap-1 text-[11px] text-amber-400">
                <RefreshCw className="w-3 h-3 shrink-0" />
                <span>Clear existing database before importing (Replace All)</span>
              </span>
            </label>
          </div>

          {/* Clear All Data Option */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-rose-300 mb-0.5">Clear All Data</h3>
              <p className="text-[11px] text-rose-400/80">Delete all categories and bookmarks</p>
            </div>
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-200 bg-rose-800/60 hover:bg-rose-700/80 transition-colors border border-rose-700/50 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
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
