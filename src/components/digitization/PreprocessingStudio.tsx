import React, { useState, useRef, useEffect } from 'react';
import { useLandRecord } from '../../context/LandRecordContext';
import { PreprocessingConfig, LandRecord } from '../../types/landRecord';
import { renderSyntheticLandRecordToCanvas } from '../../utils/documentRenderer';
import { applyDocumentFilters } from '../../utils/canvasFilters';
import {
  Sliders,
  RotateCw,
  Sparkles,
  Layers,
  Wand2,
  FileCheck,
  CheckCircle2,
  Download,
  Eye,
  RefreshCw,
  Split,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

export const PreprocessingStudio: React.FC = () => {
  const { activeRecord, updateActiveRecord, runOcrExtraction, setActiveTab, records, setActiveRecordId } = useLandRecord();

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

  const [config, setConfig] = useState<PreprocessingConfig>(
    activeRecord?.preprocessingConfig || {
      deskewAngle: 0.8,
      binarizationThreshold: 145,
      denoisingLevel: 30,
      contrastBoost: 40,
      inkRecovery: true,
      stampSuppression: false,
      superResolution: true
    }
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTabMode, setActiveTabMode] = useState<'SIDE_BY_SIDE' | 'PROCESSED_ONLY' | 'ORIGINAL_ONLY'>('SIDE_BY_SIDE');

  // Sync config when activeRecord changes
  useEffect(() => {
    if (activeRecord) {
      setConfig(activeRecord.preprocessingConfig);
    }
  }, [activeRecord?.id]);

  // Render original canvas and apply filters to processed canvas
  useEffect(() => {
    if (!activeRecord || !originalCanvasRef.current || !processedCanvasRef.current) return;

    renderSyntheticLandRecordToCanvas(originalCanvasRef.current, activeRecord);
    applyDocumentFilters(originalCanvasRef.current, processedCanvasRef.current, config);
  }, [activeRecord, config]);

  const handleAutoEnhance = () => {
    setConfig({
      deskewAngle: 0.0,
      binarizationThreshold: 140,
      denoisingLevel: 35,
      contrastBoost: 45,
      inkRecovery: true,
      stampSuppression: false,
      superResolution: true
    });
  };

  const handleRunOcr = async () => {
    if (!activeRecord) return;
    setIsProcessing(true);
    updateActiveRecord({ preprocessingConfig: config });
    await runOcrExtraction(activeRecord.id);
    setIsProcessing(false);
    setActiveTab('SPLIT_VERIFY');
  };

  if (!activeRecord) {
    return <div className="p-8 text-center text-slate-400">No active document selected.</div>;
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-85px)] bg-slate-950 text-slate-100">
      {/* Header & Record Switcher Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Wand2 className="w-4 h-4" />
            AI Document Ingestion & Vision Pre-Processing Studio
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Image Restoration & Multilingual Binarization Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time noise filtering, skew angle normalization, faded ink contrast recovery, and stamp suppression prior to OCR inference.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-medium">Sample:</span>
          {records.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRecordId(r.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeRecord.id === r.id
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.documentLanguage.toUpperCase()} - {r.documentType.slice(0, 7)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 1 Col: Vision Filters Control Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5 h-fit">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Restoration Parameters
            </h3>
            <button
              onClick={handleAutoEnhance}
              className="text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-medium transition-colors inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Auto-Tune
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Deskew Angle */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                  Skew Angle Correction
                </label>
                <span className="font-mono text-emerald-400 font-bold">{config.deskewAngle}°</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.2"
                value={config.deskewAngle}
                onChange={(e) => setConfig({ ...config, deskewAngle: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-10°</span>
                <span>0° (Level)</span>
                <span>+10°</span>
              </div>
            </div>

            {/* 2. Adaptive Binarization Threshold */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-300 font-medium">Binarization (Sauvola / Otsu)</label>
                <span className="font-mono text-emerald-400 font-bold">{config.binarizationThreshold}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                step="1"
                value={config.binarizationThreshold}
                onChange={(e) => setConfig({ ...config, binarizationThreshold: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 (Grayscale)</span>
                <span>140 (Standard)</span>
                <span>255 (Max Contrast)</span>
              </div>
            </div>

            {/* 3. Contrast & Gamma Boost */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-300 font-medium">Contrast & Gamma Boost</label>
                <span className="font-mono text-teal-400 font-bold">+{config.contrastBoost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={config.contrastBoost}
                onChange={(e) => setConfig({ ...config, contrastBoost: parseInt(e.target.value) })}
                className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* 4. Denoising Level */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-300 font-medium">Noise & Artifact Smoothing</label>
                <span className="font-mono text-teal-400 font-bold">{config.denoisingLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={config.denoisingLevel}
                onChange={(e) => setConfig({ ...config, denoisingLevel: parseInt(e.target.value) })}
                className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Feature Toggles */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Faded Ink Stroke Recovery</span>
                <input
                  type="checkbox"
                  checked={config.inkRecovery}
                  onChange={(e) => setConfig({ ...config, inkRecovery: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Suppress Revenue Stamp Clutter</span>
                <input
                  type="checkbox"
                  checked={config.stampSuppression}
                  onChange={(e) => setConfig({ ...config, stampSuppression: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">AI Super-Resolution Sharpening</span>
                <input
                  type="checkbox"
                  checked={config.superResolution}
                  onChange={(e) => setConfig({ ...config, superResolution: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
                />
              </label>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={handleRunOcr}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Vision Transformer...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Apply & Execute Deep OCR
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 3 Cols: Dual Canvas Before / After Viewer */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col">
          {/* Canvas Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTabMode('SIDE_BY_SIDE')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTabMode === 'SIDE_BY_SIDE'
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Split View (Original vs Restored)
              </button>
              <button
                onClick={() => setActiveTabMode('PROCESSED_ONLY')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTabMode === 'PROCESSED_ONLY'
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AI Enhanced View
              </button>
              <button
                onClick={() => setActiveTabMode('ORIGINAL_ONLY')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTabMode === 'ORIGINAL_ONLY'
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Original Raw Scan
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setZoomLevel(Math.max(40, zoomLevel - 15))}
                className="p-1 text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-slate-300 font-semibold w-10 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(250, zoomLevel + 15))}
                className="p-1 text-slate-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="text-[10px] text-emerald-400 hover:underline ml-1"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Canvas Render Area */}
          <div className="flex-1 bg-slate-950/90 rounded-xl border border-slate-800/80 p-4 overflow-auto min-h-[520px] max-h-[640px] flex items-center justify-center">
            <div className="flex flex-wrap items-start justify-center gap-6" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}>
              {/* Original Canvas */}
              {(activeTabMode === 'SIDE_BY_SIDE' || activeTabMode === 'ORIGINAL_ONLY') && (
                <div className="flex flex-col items-center">
                  <div className="text-[11px] font-semibold text-slate-400 bg-slate-900/90 px-3 py-1 rounded-t-lg border-t border-x border-slate-800 font-mono">
                    RAW SCAN (Original)
                  </div>
                  <div className="shadow-2xl rounded-b-lg overflow-hidden border border-slate-800 bg-white">
                    <canvas ref={originalCanvasRef} className="max-w-[440px] h-auto object-contain block" />
                  </div>
                </div>
              )}

              {/* Filtered Processed Canvas */}
              {(activeTabMode === 'SIDE_BY_SIDE' || activeTabMode === 'PROCESSED_ONLY') && (
                <div className="flex flex-col items-center">
                  <div className="text-[11px] font-semibold text-emerald-400 bg-slate-900/90 px-3 py-1 rounded-t-lg border-t border-x border-emerald-500/30 font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    AI RESTORED (Deskewed & Binarized)
                  </div>
                  <div className="shadow-2xl rounded-b-lg overflow-hidden border border-emerald-500/30 bg-white">
                    <canvas ref={processedCanvasRef} className="max-w-[440px] h-auto object-contain block" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
