import React from 'react';
import { useLandRecord } from '../../context/LandRecordContext';
import { DocumentCanvasViewer } from './DocumentCanvasViewer';
import { ExtractedFieldsForm } from './ExtractedFieldsForm';
import {
  SplitSquareVertical,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Sparkles,
  ArrowLeftRight
} from 'lucide-react';

export const SplitVerificationEditor: React.FC = () => {
  const { records, activeRecord, setActiveRecordId, setActiveTab } = useLandRecord();

  return (
    <div className="flex flex-col h-[calc(100vh-85px)] p-4 space-y-3 bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Document Shelf Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-xs shrink-0">
        <div className="flex items-center space-x-3 overflow-x-auto py-1">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-emerald-400" /> Active Queue:
          </span>
          {records.map((r) => {
            const isSelected = activeRecord?.id === r.id;
            const hasDispute = r.status === 'DISPUTED' || (r.validationIssues && r.validationIssues.some(i => i.severity === 'CRITICAL'));
            return (
              <button
                key={r.id}
                onClick={() => setActiveRecordId(r.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${hasDispute ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
                <span>{r.recordNumber.split('-').slice(0, 2).join('-')} ({r.documentLanguage.toUpperCase()})</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {r.khasraNumber}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 shrink-0 ml-3">
          <button
            onClick={() => setActiveTab('DIGITIZE_STUDIO')}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            Image Preprocessing Studio
          </button>
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-0">
        {/* Left Pane: High-Res Interactive Canvas with Bounding Boxes (5 cols on lg, 6 cols on xl) */}
        <div className="lg:col-span-6 xl:col-span-5 h-full overflow-hidden">
          <DocumentCanvasViewer />
        </div>

        {/* Right Pane: Comprehensive Extracted DILRMP Form (7 cols on lg, 7 cols on xl) */}
        <div className="lg:col-span-6 xl:col-span-7 h-full overflow-hidden">
          <ExtractedFieldsForm />
        </div>
      </div>
    </div>
  );
};
