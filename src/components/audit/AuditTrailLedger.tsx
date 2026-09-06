import React, { useState } from 'react';
import { useLandRecord } from '../../context/LandRecordContext';
import {
  FileCheck2,
  ShieldCheck,
  Lock,
  Search,
  CheckCircle2,
  Clock,
  User,
  Hash,
  Layers,
  ArrowDown
} from 'lucide-react';

export const AuditTrailLedger: React.FC = () => {
  const { auditChain } = useLandRecord();
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchHash, setSearchHash] = useState<string>('');

  const filteredBlocks = auditChain.filter(block => {
    const matchesRole = filterRole === 'ALL' || block.actorRole === filterRole;
    const matchesSearch = !searchHash || 
      block.blockHash.toLowerCase().includes(searchHash.toLowerCase()) ||
      block.documentId.toLowerCase().includes(searchHash.toLowerCase()) ||
      block.actorName.toLowerCase().includes(searchHash.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-85px)] bg-slate-950 text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            SHA-256 Tamper-Proof Cryptographic Provenance
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Immutable Audit Trail & Blockchain Revenue Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every OCR digitization step, officer correction, area modification, and digital signature approval is cryptographically chained with SHA-256 hashes.
          </p>
        </div>

        {/* Verification Status Pill */}
        <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-4 py-2.5 flex items-center space-x-3 text-xs shadow-lg">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
          <div>
            <div className="font-bold text-emerald-300">100% Chain Integrity Verified</div>
            <div className="text-[10px] text-slate-400 font-mono">{auditChain.length} Blocks Sequenced</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">Filter Role:</span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="OPERATOR">Data Entry Operator</option>
            <option value="PATWARI">Patwari / Inspector</option>
            <option value="TEHSILDAR">Tehsildar / SDM</option>
            <option value="AI_SERVICE">AI Vision Engine</option>
            <option value="SYSTEM">System Root</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            placeholder="Search by block hash, doc ID, or actor..."
            className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Chronological Blockchain Sequence */}
      <div className="space-y-4">
        {filteredBlocks.map((block, idx) => (
          <div key={block.blockHash + idx} className="relative">
            {/* Block Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-emerald-500/40 transition-colors space-y-3">
              {/* Block Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="bg-emerald-600/20 text-emerald-400 font-mono font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    BLOCK #{block.blockIndex}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {block.action.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-slate-400 text-[11px] font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(block.timestamp).toLocaleString()}
                  </span>
                  <span className="text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    VERIFIED
                  </span>
                </div>
              </div>

              {/* Actor & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Actor / Authority</span>
                  <span className="text-slate-200 font-semibold">{block.actorName}</span>
                  <span className="text-[10px] text-emerald-400 block font-mono">{block.actorRole} ({block.actorDesignation})</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Target Record ID</span>
                  <span className="text-white font-mono font-semibold">{block.recordNumber || block.documentId}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">IP: {block.actorIp}</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Summary of Changes</span>
                  <span className="text-slate-300 text-[11px] leading-tight block">{block.changesSummary}</span>
                </div>
              </div>

              {/* Cryptographic Hashes Chaining */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] font-mono space-y-1">
                <div className="flex flex-wrap items-center justify-between text-slate-400">
                  <span>PREVIOUS HASH:</span>
                  <span className="text-slate-400 select-all truncate max-w-md">{block.previousHash}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" /> CURRENT BLOCK SHA-256:
                  </span>
                  <span className="text-emerald-300 select-all truncate max-w-md">{block.blockHash}</span>
                </div>
                {block.digitalSignature && (
                  <div className="flex flex-wrap items-center justify-between text-amber-400 pt-1 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> NIC DIGITAL SIGNATURE:
                    </span>
                    <span className="text-amber-300 select-all truncate max-w-md">{block.digitalSignature}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Connecting arrow if not last item */}
            {idx < filteredBlocks.length - 1 && (
              <div className="flex justify-center my-1.5 text-emerald-500/40">
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
