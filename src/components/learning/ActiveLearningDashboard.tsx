import React, { useState } from 'react';
import { useLandRecord } from '../../context/LandRecordContext';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Database,
  Layers,
  Zap,
  ArrowRight,
  GitBranch
} from 'lucide-react';

export const ActiveLearningDashboard: React.FC = () => {
  const { activeLearningTokens, modelMetrics, retrainModelBatch, t } = useLandRecord();
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      retrainModelBatch();
      setIsRetraining(false);
      setRetrainSuccess(true);
      setTimeout(() => setRetrainSuccess(false), 4000);
    }, 1800);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-85px)] bg-slate-950 text-slate-100">
      {/* Toast Alert */}
      {retrainSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xl animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Model retrained on {activeLearningTokens.length * 120} feedback tokens! CRR Accuracy increased to {modelMetrics.overallAccuracyPercent}%.
          </span>
          <button onClick={() => setRetrainSuccess(false)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <BrainCircuit className="w-4 h-4" />
            Continuous Learning & Human-in-the-Loop Feedback Loop
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {t('learningTitle')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('learningSubtitle')}
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {isRetraining ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Retraining Transformer Epoch...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t('triggerRetrain')}
            </>
          )}
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-slate-400 text-xs mb-1">Model Checkpoint</div>
          <div className="text-sm font-bold text-white font-mono">{modelMetrics.modelVersion}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
            <Cpu className="w-3.5 h-3.5" /> Epoch {modelMetrics.feedbackBatchesProcessed}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-slate-400 text-xs mb-1">Mean CRR Accuracy</div>
          <div className="text-xl font-bold text-emerald-400 font-mono">{modelMetrics.overallAccuracyPercent}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            +2.4% gain over last 5 batches
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-slate-400 text-xs mb-1">Handwritten Devanagari CRR</div>
          <div className="text-xl font-bold text-teal-300 font-mono">{modelMetrics.handwrittenAccuracyPercent}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Character Error Rate: {modelMetrics.characterErrorRatePercent}%
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-slate-400 text-xs mb-1">Feedback Tokens Trained</div>
          <div className="text-xl font-bold text-cyan-300 font-mono">{(modelMetrics.totalTokensTrained / 1000000).toFixed(2)}M</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {activeLearningTokens.length} Pending in Buffer
          </div>
        </div>
      </div>

      {/* Accuracy Progression Trend & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Accuracy Epoch Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              OCR Character Recognition Rate (CRR) Progression
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Last retrained: {new Date().toLocaleDateString()}
            </span>
          </div>

          {/* Bar / Progression visualizer */}
          <div className="space-y-3 pt-2">
            {modelMetrics.accuracyTrend.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-300 font-medium">Epoch {item.epoch} ({item.date})</span>
                  <span className="text-emerald-400 font-bold">{item.accuracy}% CRR</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(item.accuracy - 80) * 5}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Confusion Matrix Preview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-amber-400" />
            Top Confused Glyphs (Devanagari / Modi)
          </h3>

          <div className="space-y-2 text-xs">
            {modelMetrics.confusionMatrixSample.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-emerald-400 font-mono">{c.expected}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="font-bold text-rose-400 font-mono">{c.predicted}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {c.count} corrections
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Learning Corrected Tokens Queue Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              {t('feedbackTokens')}
            </h3>
            <p className="text-xs text-slate-400">
              Tokens transcribed and approved by Patwaris across revenue circles awaiting next fine-tuning epoch.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5">Field / Doc Type</th>
                <th className="px-3 py-2.5">Original OCR (Misrecognized)</th>
                <th className="px-3 py-2.5">Corrected Ground Truth</th>
                <th className="px-3 py-2.5">Language / Script</th>
                <th className="px-3 py-2.5">Verified By</th>
                <th className="px-3 py-2.5 text-right">Queue Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeLearningTokens.map((tok) => (
                <tr key={tok.id} className="hover:bg-slate-800/40">
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-white">{tok.fieldLabel}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{tok.documentType}</div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-rose-300 line-through">
                    {tok.originalOcrText}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-emerald-400 font-bold">
                    {tok.correctedText}
                  </td>
                  <td className="px-3 py-2.5">
                    <div>{tok.language}</div>
                    <div className="text-[10px] text-slate-500">{tok.script}</div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-400">{tok.correctedBy}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        tok.status === 'DEPLOYED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {tok.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
