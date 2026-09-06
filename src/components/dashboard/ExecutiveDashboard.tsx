import React, { useState } from 'react';
import { useLandRecord } from '../../context/LandRecordContext';
import { STATE_DIGITIZATION_PROGRESS, OCR_PERFORMANCE_METRICS } from '../../data/mockAnalytics';
import {
  FileText,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Sparkles,
  TrendingUp,
  Map,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Database,
  Search,
  ScanLine,
  ChevronRight,
  Award,
  Layers,
  BarChart3
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const { records, setActiveRecordId, setActiveTab, t } = useLandRecord();
  const [selectedStateCode, setSelectedStateCode] = useState<string>('UP');

  const selectedState = STATE_DIGITIZATION_PROGRESS.find(s => s.stateCode === selectedStateCode) || STATE_DIGITIZATION_PROGRESS[0];

  const totalDigitized = records.length;
  const verifiedCount = records.filter(r => r.status === 'APPROVED_TEHSILDAR' || r.status === 'SYNCED_LRMS' || r.status === 'VERIFIED_PATWARI').length;
  const pendingCount = records.filter(r => r.status === 'VERIFICATION_PENDING').length;
  const disputedCount = records.filter(r => r.status === 'DISPUTED' || (r.validationIssues && r.validationIssues.some(i => i.severity === 'CRITICAL'))).length;

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-85px)] bg-slate-950 text-slate-100">
      {/* Hero Welcome & Quick Launch Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {t('heroTitle')}
            </h2>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              {t('heroSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('DIGITIZE_STUDIO')}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/40 transition-all transform hover:-translate-y-0.5"
            >
              <ScanLine className="w-4 h-4" />
              {t('uploadAndDigitize')}
            </button>
            <button
              onClick={() => setActiveTab('SPLIT_VERIFY')}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {t('launchHitl')} ({pendingCount})
            </button>
          </div>
        </div>
      </div>

      {/* Top 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Processed */}
        <div
          onClick={() => {
            if (records[0]) setActiveRecordId(records[0].id);
            setActiveTab('SPLIT_VERIFY');
          }}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer transform hover:-translate-y-0.5 group"
          title="Click to view all land records in HITL Verification"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="group-hover:text-indigo-300 transition-colors">{t('kpiMonthly')}</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white font-mono">1,24,890</div>
          <div className="flex items-center text-[11px] text-emerald-400 mt-1.5 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            +18.4% this week
          </div>
        </div>

        {/* Mean OCR Accuracy */}
        <div
          onClick={() => setActiveTab('ACTIVE_LEARNING')}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer transform hover:-translate-y-0.5 group"
          title="Click to view Active Learning OCR accuracy and retraining queue"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="group-hover:text-emerald-300 transition-colors">{t('kpiAccuracy')}</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">96.8%</div>
          <div className="flex items-center text-[11px] text-slate-400 mt-1.5">
            <span className="text-emerald-400 font-semibold mr-1">98.2%</span> printed / 86.8% hand
          </div>
        </div>

        {/* Auto-Validated Pass */}
        <div
          onClick={() => {
            const valRec = records.find(r => r.status === 'APPROVED_TEHSILDAR' || r.status === 'SYNCED_LRMS') || records[0];
            if (valRec) setActiveRecordId(valRec.id);
            setActiveTab('SPLIT_VERIFY');
          }}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-teal-500/50 hover:bg-slate-900 transition-all cursor-pointer transform hover:-translate-y-0.5 group"
          title="Click to open auto-validated land record"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="group-hover:text-teal-300 transition-colors">{t('kpiAutoRule')}</span>
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-teal-300 font-mono">88.7%</div>
          <div className="text-[11px] text-slate-400 mt-1.5">
            0 human errors on math checks
          </div>
        </div>

        {/* Pending Verification */}
        <div
          onClick={() => {
            const pendRec = records.find(r => r.status === 'VERIFICATION_PENDING') || records[0];
            if (pendRec) setActiveRecordId(pendRec.id);
            setActiveTab('SPLIT_VERIFY');
          }}
          className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 shadow-sm hover:border-amber-400 hover:bg-slate-900 hover:shadow-amber-500/10 transition-all cursor-pointer transform hover:-translate-y-0.5 group"
          title="Click to immediately open pending record in Split Verification"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="group-hover:text-amber-300 transition-colors font-medium">{t('kpiPending')}</span>
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">{pendingCount} Records</div>
          <div className="text-[11px] text-amber-300/80 mt-1.5 font-medium">
            Avg review time: 18 sec
          </div>
        </div>

        {/* Disputed / High Risk */}
        <div
          onClick={() => {
            const dispRec = records.find(r => r.status === 'DISPUTED' || (r.validationIssues && r.validationIssues.length > 0)) || records[0];
            if (dispRec) setActiveRecordId(dispRec.id);
            setActiveTab('SPLIT_VERIFY');
          }}
          className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-4 shadow-sm hover:border-rose-400 hover:bg-slate-900 hover:shadow-rose-500/10 transition-all cursor-pointer transform hover:-translate-y-0.5 group"
          title="Click to immediately open flagged/disputed record in Split Verification"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="group-hover:text-rose-300 transition-colors font-medium">{t('kpiDisputes')}</span>
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">{disputedCount} Cases</div>
          <div className="text-[11px] text-rose-300/80 mt-1.5">
            Area mismatch / SDM stay
          </div>
        </div>

        {/* SHA-256 Audit Blocks */}
        <div
          onClick={() => setActiveTab('AUDIT_LEDGER')}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer transform hover:-translate-y-0.5 group"
          title="Click to inspect Blockchain Audit Ledger"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="group-hover:text-cyan-300 transition-colors">{t('kpiBlockchain')}</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-cyan-300 font-mono">48,912</div>
          <div className="flex items-center text-[11px] text-cyan-400/80 mt-1.5 font-medium">
            100% Tamper Verified
          </div>
        </div>
      </div>

      {/* Main Two-Column Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: State-wise DILRMP Modernization Heatmap & Progress */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Map className="w-4 h-4 text-emerald-400" />
                {t('stateProgressTitle')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('stateProgressSubtitle')}
              </p>
            </div>

            {/* State Selector Buttons */}
            <div className="flex flex-wrap gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {STATE_DIGITIZATION_PROGRESS.map((st) => (
                <button
                  key={st.stateCode}
                  onClick={() => setSelectedStateCode(st.stateCode)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedStateCode === st.stateCode
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st.stateCode}
                </button>
              ))}
            </div>
          </div>

          {/* Selected State Spotlight Detail Card */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('selectedTerritory')}</span>
              <span className="text-base font-bold text-white block">{selectedState.stateName}</span>
              <span className="text-xs text-emerald-400 font-devanagari">{selectedState.vernacularName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('villagesModernized')}</span>
              <span className="text-base font-bold text-white font-mono">
                {selectedState.digitizedVillages.toLocaleString('en-IN')} / {selectedState.totalVillages.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400">({selectedState.progressPercent}% Completed)</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('parcelsMapped')}</span>
              <span className="text-base font-bold text-white font-mono">
                {(selectedState.digitizedParcelsCount / 1000000).toFixed(1)}M / {(selectedState.totalParcelsCount / 1000000).toFixed(1)}M
              </span>
              <span className="text-[11px] text-teal-400 font-medium">96.4% GIS Vectorized</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('aiAccuracyRate')}</span>
              <span className="text-base font-bold text-emerald-400 font-mono">{selectedState.accuracyRatePercent}%</span>
              <span className="text-[11px] text-rose-400">{selectedState.activeDisputesCount} Active Disputes</span>
            </div>
          </div>

          {/* All States Progress Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">State / UT</th>
                  <th className="px-3 py-2.5">Progress</th>
                  <th className="px-3 py-2.5">Digitized Villages</th>
                  <th className="px-3 py-2.5">Parcels Mapped</th>
                  <th className="px-3 py-2.5">AI OCR CRR</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {STATE_DIGITIZATION_PROGRESS.map((st) => (
                  <tr 
                    key={st.stateCode} 
                    onClick={() => setSelectedStateCode(st.stateCode)}
                    className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${selectedStateCode === st.stateCode ? 'bg-emerald-950/20' : ''}`}
                  >
                    <td className="px-3 py-2.5 font-medium text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-bold">
                        {st.stateCode}
                      </span>
                      <div>
                        <div>{st.stateName}</div>
                        <div className="text-[10px] text-slate-500">{st.vernacularName}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 w-36">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              st.progressPercent >= 95 ? 'bg-emerald-500' : st.progressPercent >= 90 ? 'bg-teal-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${st.progressPercent}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[11px] font-semibold">{st.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono">{st.digitizedVillages.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2.5 font-mono">{(st.digitizedParcelsCount / 100000).toFixed(1)} Lakh</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center text-emerald-400 font-mono font-semibold">
                        {st.accuracyRatePercent}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('CADASTRAL_GIS');
                        }}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-0.5"
                      >
                        GIS Map <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: AI Processing Pipeline & Language Breakdown */}
        <div className="space-y-6">
          {/* AI Vision Pipeline Engine Stats */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                AI Inference & OCR Pipeline
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                Online (2.8s Latency)
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Core Vision Transformer</span>
                <span className="font-mono text-slate-200 font-semibold">BhoomiVision LayoutLMv3</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Handwritten Devanagari OCR</span>
                <span className="font-mono text-emerald-400 font-semibold">CRNN + CTC Attention (86.8%)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Dravidian Script Parser</span>
                <span className="font-mono text-teal-400 font-semibold">Tamil / Telugu VGG-Seq2Seq</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Area Math Summation Engine</span>
                <span className="font-mono text-indigo-400 font-semibold">100% Deterministic Rule-Check</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Active Learning Retrain Cycles</span>
                <span className="font-mono text-amber-400 font-semibold">42 Epochs Completed</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('ACTIVE_LEARNING')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Inspect AI Model Feedback Queue
            </button>
          </div>

          {/* Multilingual Document Distribution */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Multilingual Records Ingestion
            </h3>

            <div className="space-y-2.5">
              {OCR_PERFORMANCE_METRICS.languageDistribution.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">{item.language}</span>
                    <span className="text-slate-400 font-mono">{item.share}% ({item.count.toLocaleString('en-IN')})</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-teal-500' : idx === 2 ? 'bg-indigo-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${item.share}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preloaded Authentic Sample Records Quick-Launch Shelf */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              {t('sampleRecordsTitle')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('sampleRecordsSubtitle')}
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {records.length} Documents Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {records.map((rec) => {
            const hasIssue = rec.validationIssues && rec.validationIssues.length > 0;
            return (
              <div
                key={rec.id}
                onClick={() => {
                  setActiveRecordId(rec.id);
                  setActiveTab('SPLIT_VERIFY');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between ${
                  rec.status === 'DISPUTED' || hasIssue
                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                    : rec.status === 'APPROVED_TEHSILDAR' || rec.status === 'SYNCED_LRMS'
                    ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-mono text-slate-400">{rec.recordNumber.split('-').slice(0, 2).join('-')}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.status === 'DISPUTED' || hasIssue
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : rec.status === 'APPROVED_TEHSILDAR'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {rec.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                    {rec.documentTitle}
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {rec.district.split(' ')[0]}, {rec.state.split(' ')[0]}
                  </div>

                  <div className="mt-3 text-[11px] space-y-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('khasraNoLabel').split('/')[0]}:</span>
                      <span className="text-slate-200 font-bold">{rec.khasraNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('plotAreaLabel')}:</span>
                      <span className="text-emerald-400 font-bold">{rec.plotAreaOriginal} {rec.plotAreaUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">OCR CRR:</span>
                      <span className="text-slate-200">{rec.characterAccuracy}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500">{rec.owners.length} Co-Owner(s)</span>
                  <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                    {t('openStudio')} <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
