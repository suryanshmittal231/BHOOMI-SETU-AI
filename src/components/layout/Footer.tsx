import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 px-4 py-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center space-x-4">
        <span>© 2024-2026 Smart India Hackathon (SIH) - AI Land Record Modernization Prototype</span>
        <span className="text-slate-700">•</span>
        <span className="text-slate-400">Compliant with Digital India Land Records Modernization Programme (DILRMP)</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-emerald-400 font-mono">BhoomiVision Transformer LayoutLMv3</span>
        <span className="text-slate-700">•</span>
        <span className="text-amber-400 font-mono">WASM OCR Engine Active</span>
        <span className="text-slate-700">•</span>
        <span className="text-cyan-400 font-mono">Bhuvan GIS Spatial Sync</span>
      </div>
    </footer>
  );
};
